import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createArchiveIndex,
  queryArchive,
  searchArchive,
} from "../src/archive-search.js";
import { parseSearchRoute, searchHref } from "../src/search-routes.js";
import {
  FAVORITES_KEY,
  LIBRARY_KEY,
  RECENT_LIMIT,
  emptyLibrary,
  normalizeLibrary,
  normalizeRecent,
  readLibrary,
  referenceForRoute,
  safeReference,
  systemReference,
  updateLibrary,
  visitRecent,
} from "../src/personal-archive.js";
import { powerFacts, resistanceSummary } from "../src/power-summary.js";
const systems = JSON.parse(
  readFileSync(new URL("../src/content.json", import.meta.url)),
);
const index = createArchiveIndex(systems);

test("busca completa preserva ranking da prévia e pagina resultados sem repetições", () => {
  const all = queryArchive(index, "força de vontade", { limit: index.length });
  assert.ok(all.total > 20);
  assert.deepEqual(
    all.items.slice(0, 5).map((item) => item.id),
    searchArchive(index, "força de vontade").map((item) => item.id),
  );
  const first = queryArchive(index, "força de vontade", { limit: 20 });
  const second = queryArchive(index, "força de vontade", {
    limit: 20,
    offset: 20,
  });
  assert.equal(first.total, second.total);
  assert.deepEqual(
    [...first.items, ...second.items].map((item) => item.id),
    all.items.slice(0, 40).map((item) => item.id),
  );
  assert.equal(
    new Set([...first.items, ...second.items].map((item) => item.id)).size,
    40,
  );
});
test("busca combina filtros de sistema, área e edição e não preenche resultados incompatíveis", () => {
  const result = queryArchive(index, "vida", {
    systemId: "mago",
    area: "mechanics",
    edition: "20A",
    limit: 100,
  });
  assert.ok(result.total > 5);
  assert.ok(
    result.items.every(
      (item) =>
        item.systemId === "mago" &&
        item.area === "mechanics" &&
        item.editionLabel === "20A",
    ),
  );
  assert.equal(
    queryArchive(index, "vida", { systemId: "mago", edition: "5E" }).total,
    0,
  );
  assert.equal(
    queryArchive(index, "Talecraft", { systemId: "cacador" }).total,
    0,
  );
  const category = queryArchive(index, "vida", {
    systemId: "mago",
    group: "Esferas",
  });
  assert.ok(category.total > 0);
  assert.ok(category.items.every((item) => item.group === "Esferas"));
});
test("rotas da busca preservam termos, acentos e filtros; parâmetros inválidos não entram no escopo", () => {
  const route = searchHref("Força & Vida?", {
    systemId: "mago",
    area: "mechanics",
    edition: "20A",
    group: "",
    page: 2,
  });
  assert.deepEqual(parseSearchRoute(route, systems), {
    query: "Força & Vida?",
    systemId: "mago",
    area: "mechanics",
    edition: "20A",
    group: "",
    page: 2,
  });
  const invalid = parseSearchRoute(
    "#/busca?q=vida&sistema=outro&area=segredo&edicao=17&pagina=-3",
    systems,
  );
  assert.deepEqual(invalid, {
    query: "vida",
    systemId: "",
    area: "",
    edition: "",
    group: "",
    page: 1,
  });
});
test("migração mantém favoritos antigos e estado novo evita ressuscitar um favorito removido", () => {
  const memory = new Map([
    [FAVORITES_KEY, JSON.stringify(["mago", "vampiro", "id-invalido"])],
  ]);
  const storage = { getItem: (key) => memory.get(key) || null };
  const migrated = readLibrary(storage, systems);
  assert.deepEqual(
    migrated.items.map((item) => item.systemId),
    ["vampiro", "mago"],
  );
  memory.set(LIBRARY_KEY, JSON.stringify(emptyLibrary()));
  assert.deepEqual(readLibrary(storage, systems).items, []);
});
test("coleções aceitam múltiplos vínculos e excluir uma coleção preserva todos os favoritos", () => {
  const reference = systemReference(systems[0]);
  let state = updateLibrary(emptyLibrary(), {
    type: "toggle",
    entry: reference,
  });
  for (const id of ["cronica", "personagem"])
    state = updateLibrary(state, { type: "create", id, name: id });
  for (const id of ["cronica", "personagem", "cronica"])
    state = updateLibrary(state, {
      type: "membership",
      href: reference.href,
      id,
      checked: true,
    });
  assert.deepEqual(state.items[0].collectionIds, ["cronica", "personagem"]);
  state = updateLibrary(state, {
    type: "rename",
    id: "cronica",
    name: "Crônica atual",
  });
  assert.equal(state.collections[0].name, "Crônica atual");
  state = updateLibrary(state, { type: "delete", id: "cronica" });
  assert.equal(state.items.length, 1);
  assert.deepEqual(state.items[0].collectionIds, ["personagem"]);
  state = updateLibrary(state, { type: "toggle", entry: reference });
  assert.equal(state.items.length, 0);
});
test("dados locais descartam links externos e referências com consultas privadas", () => {
  const entry = systemReference(systems[0]);
  for (const href of [
    "https://example.com",
    "javascript:alert(1)",
    "#/sistema/vampiro/ficha?nome=Pessoa",
    "#/sistema/vampiro2",
  ])
    assert.equal(safeReference({ ...entry, href }, systems), null);
  const normalized = normalizeLibrary(
    {
      version: 1,
      collections: [{ id: "x", name: "Mesa" }],
      items: [{ ...entry, collectionIds: ["x", "x", "ausente"] }, { ...entry }],
    },
    systems,
  );
  assert.equal(normalized.items.length, 1);
  assert.deepEqual(normalized.items[0].collectionIds, ["x"]);
});
test("histórico mantém as 40 últimas consultas, move revisitas para o topo e não inclui estado da ficha", () => {
  const mage = systems.find((system) => system.id === "mago");
  let recent = [];
  for (const [i, section] of mage.sections
    .slice(0, RECENT_LIMIT + 5)
    .entries()) {
    const category = { lore: "lore", mechanics: "mecanica", sheet: "ficha" }[
      section.category
    ];
    const reference = referenceForRoute(
      mage,
      `#/sistema/mago/${category}/${section.id}`,
    );
    assert.ok(reference);
    recent = visitRecent(recent, reference, i + 1);
  }
  assert.equal(recent.length, RECENT_LIMIT);
  const last = recent.at(-1);
  recent = visitRecent(recent, last, 100);
  assert.equal(recent[0].href, last.href);
  assert.equal(recent[0].viewedAt, 100);
  assert.equal(new Set(recent.map((entry) => entry.href)).size, RECENT_LIMIT);
  assert.equal(
    referenceForRoute(mage, "#/sistema/mago/mecanica/inexistente"),
    null,
  );
  assert.equal(referenceForRoute(mage, "#/busca?q=segredo"), null);
  assert.deepEqual(normalizeRecent([{ ...last, viewedAt: -1 }], systems), []);
  assert.deepEqual(
    normalizeRecent([{ ...last, viewedAt: Number.MAX_SAFE_INTEGER }], systems),
    [],
  );
});
test("resistência mostra somente texto explícito; campo ausente nunca vira ativação automática ou custo zero", () => {
  assert.deepEqual(
    resistanceSummary({
      resistance: "Vigor + Sobrevivência",
      rules: "outra regra",
    }),
    { text: "Vigor + Sobrevivência", quoted: false },
  );
  const rules =
    "Ative o poder. O alvo pode resistir com Vigor + Sobrevivência. Conte os sucessos.";
  assert.equal(
    resistanceSummary({ rules }).text,
    "O alvo pode resistir com Vigor + Sobrevivência.",
  );
  const facts = powerFacts({ roll: "–", cost: "", duration: "" });
  assert.equal(facts.length, 4);
  assert.ok(facts.every((fact) => fact.text.length > 0));
  assert.ok(
    facts.every((fact) => !/automático|sem custo|custo zero/i.test(fact.text)),
  );
  assert.equal(
    powerFacts({
      rules:
        "Quando começar uma jornada, o jogador gasta 3 pontos de Pathos e testa Percepção + Argos (dificuldade 8).",
    })[1].quoted,
    true,
  );
  for (const system of systems)
    for (const section of system.sections.filter((item) => item.power)) {
      const fields = powerFacts(section.power);
      assert.deepEqual(
        fields.map((fact) => fact.id),
        ["roll", "cost", "resistance", "duration"],
      );
      if (section.power.roll && !/^[–—-]$/.test(section.power.roll.trim()))
        assert.equal(fields[0].text, section.power.roll);
    }
});
