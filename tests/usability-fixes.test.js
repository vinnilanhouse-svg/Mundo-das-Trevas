import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createArchiveIndex,
  queryArchive,
  searchArchive,
} from "../src/archive-search.js";
import { interpretSearchQuery } from "../src/search-query.js";
import {
  compatibleSearchEdition,
  searchEditions,
  parseSearchRoute,
  searchHref,
} from "../src/search-routes.js";
const systems = JSON.parse(
  readFileSync(new URL("../src/content.json", import.meta.url)),
);
const index = createArchiveIndex(systems);

test("perguntas sobre Fome encontram a regra de Vampiro antes de menções incidentais", () => {
  for (const query of [
    "como funciona a fome",
    "como faço um teste de fome",
    "Como eu faço um teste de Fome?",
    "qual a rolagem de fome",
    "me explique como funciona a fome",
    "por favor como faço um teste de fome",
  ]) {
    const first = searchArchive(index, query)[0];
    assert.equal(first?.systemId, "vampiro", query);
    assert.equal(first?.title, "Fome e testes de Despertar", query);
  }
  assert.equal(
    searchArchive(index, "como rolar dados de fome")[0].title,
    "Dados de Fome",
  );
});
test("perguntas preservam nomes de regras e a busca não abandona termos desconhecidos ou o escopo", () => {
  assert.equal(
    searchArchive(index, "o que é força de vontade")[0].title,
    "Força de Vontade",
  );
  assert.equal(searchArchive(index, "como lançar uma arte")[0].title, "Artes");
  assert.equal(
    searchArchive(index, "como funciona Talecraft")[0].title,
    "Fabulomancia (Talecraft)",
  );
  assert.equal(
    searchArchive(index, "como funciona Talecraft", { systemId: "cacador" })
      .length,
    0,
  );
  assert.equal(queryArchive(index, "como funciona zzzztermoausente").total, 0);
  assert.ok(
    interpretSearchQuery("poderes sem teste").terms.some(
      (term) => term.word === "sem",
    ),
  );
  const filtered = queryArchive(index, "como funciona vida", {
    systemId: "mago",
    area: "mechanics",
    group: "Esferas",
    edition: "20A",
  });
  assert.ok(filtered.total > 0);
  assert.ok(
    filtered.items.every(
      (item) => item.systemId === "mago" && item.group === "Esferas",
    ),
  );
});
test("singular, plural e termos comuns de rolagem mantêm destinos pertinentes", () => {
  for (const query of ["arcanois", "arcanos", "arcanoi"])
    assert.equal(searchArchive(index, query)[0].title, "Arcanoi");
  const tests = searchArchive(index, "teste de fome").map((item) => item.id);
  assert.deepEqual(
    searchArchive(index, "rolagem de fome").map((item) => item.id),
    tests,
  );
  assert.ok(searchArchive(index, "habilidade vigor").length > 0);
});
test("edições disponíveis seguem o sistema e parâmetros incompatíveis são corrigidos preservando a busca", () => {
  assert.deepEqual(searchEditions(systems, "mago"), ["20A"]);
  assert.deepEqual(searchEditions(systems, "vampiro"), ["5E"]);
  assert.deepEqual(new Set(searchEditions(systems)), new Set(["20A", "5E"]));
  assert.equal(compatibleSearchEdition(systems, "mago", "5E"), "20A");
  assert.equal(compatibleSearchEdition(systems, "vampiro", "20A"), "5E");
  assert.equal(compatibleSearchEdition(systems, "mago", ""), "");
  const fixed = parseSearchRoute(
    "#/busca?q=vida&sistema=mago&edicao=5E&area=mechanics&pagina=2",
    systems,
  );
  assert.equal(fixed.edition, "20A");
  assert.equal(fixed.query, "vida");
  assert.equal(fixed.systemId, "mago");
  assert.equal(fixed.area, "mechanics");
  assert.equal(fixed.page, 2);
  assert.deepEqual(
    parseSearchRoute(searchHref(fixed.query, fixed), systems),
    fixed,
  );
  const future = [
    { id: "novo", editionLabel: "1E" },
    { id: "novo", editionLabel: "2E" },
  ];
  assert.equal(compatibleSearchEdition(future, "novo", "5E"), "");
});
