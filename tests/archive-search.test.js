import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createArchiveIndex, searchArchive } from "../src/archive-search.js";
import { articleHref, groupHref } from "../src/library-routes.js";

const systems = JSON.parse(
  readFileSync(new URL("../src/content.json", import.meta.url)),
);
const index = createArchiveIndex(systems);

test("artes abre primeiro o índice de Artes de Changeling", () => {
  const [first] = searchArchive(index, "artes");
  assert.equal(first.kind, "group");
  assert.equal(first.title, "Artes");
  assert.equal(first.systemName, "Changeling 20A");
  assert.equal(first.href, groupHref("changeling", "mechanics", "Artes"));
});

test("busca global limita a cinco e identifica o sistema de todos os resultados", () => {
  const results = searchArchive(index, "força de vontade");
  assert.equal(results.length, 5);
  assert.ok(new Set(results.map((result) => result.systemId)).size > 1);
  for (const result of results) {
    const system = systems.find((item) => item.id === result.systemId);
    assert.equal(result.systemName, `${system.name} ${system.editionLabel}`);
    assert.ok(result.href.startsWith(`#/sistema/${system.id}`));
  }
  assert.equal(
    searchArchive(index, "força de vontade", { limit: 50 }).length,
    5,
  );
});

test("menos de cinco correspondências e ausência de resultados não geram preenchimento artificial", () => {
  const results = searchArchive(index, "Talecraft");
  assert.ok(results.length > 0 && results.length < 5);
  assert.equal(results[0].title, "Fabulomancia (Talecraft)");
  assert.deepEqual(searchArchive(index, "zzzztermoausente"), []);
  for (const query of ["", "   ", "!!!"])
    assert.deepEqual(searchArchive(index, query), []);
});

test("busca dentro de um sistema nunca retorna entradas dos demais", () => {
  for (const system of systems) {
    const results = searchArchive(index, "vida", { systemId: system.id });
    assert.ok(results.length <= 5);
    assert.ok(results.every((result) => result.systemId === system.id));
  }
  assert.deepEqual(
    searchArchive(index, "Talecraft", { systemId: "cacador" }),
    [],
  );
  assert.deepEqual(
    searchArchive(index, "artes", { systemId: "inexistente" }),
    [],
  );
});

test("títulos exatos precedem menções no corpo e a busca tolera acentos, caixa e pontuação", () => {
  assert.equal(
    searchArchive(index, "VIDA")[0].href,
    "#/sistema/mago/mecanica/mechanics-esferas-vida",
  );
  assert.deepEqual(
    searchArchive(index, "FORÇA de VONTADE").map((r) => r.id),
    searchArchive(index, "forca de vontade").map((r) => r.id),
  );
  assert.equal(
    searchArchive(index, "artes, changeling")[0].systemId,
    "changeling",
  );
  assert.equal(searchArchive(index, "artes, changeling")[0].title, "Artes");
  assert.equal(searchArchive(index, "arcanos")[0].title, "Arcanoi");
});

test("paradas e orientações de poderes são pesquisáveis e todos os destinos existem", () => {
  const matches = searchArchive(index, "Raciocínio + Argos");
  assert.ok(matches.some((result) => result.title === "2 · Asas Fantasmas"));
  assert.ok(matches.every((result) => result.systemId === "aparicao"));
  assert.equal(new Set(index.map((entry) => entry.id)).size, index.length);
  for (const entry of index) {
    const system = systems.find((item) => item.id === entry.systemId);
    if (entry.kind === "article")
      assert.ok(
        system.sections.some(
          (section) => articleHref(system.id, section) === entry.href,
        ),
        entry.href,
      );
    if (entry.kind === "group")
      assert.ok(
        system.sections.some(
          (section) =>
            groupHref(system.id, section.category, section.group) ===
            entry.href,
        ),
        entry.href,
      );
  }
});
