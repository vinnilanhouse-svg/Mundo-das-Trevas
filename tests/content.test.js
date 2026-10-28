import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const content = JSON.parse(
  readFileSync(new URL("../src/content.json", import.meta.url)),
);
const sources = JSON.parse(
  readFileSync(new URL("../src/sources.json", import.meta.url)),
);
const sourcesById = new Map(sources.map((source) => [source.id, source]));

test("catálogo tem somente os cinco sistemas e suas edições selecionadas", () => {
  assert.deepEqual(
    content.map((system) => [system.id, system.editionLabel]),
    [
      ["vampiro", "5E"],
      ["changeling", "20A"],
      ["cacador", "5E"],
      ["mago", "20A"],
      ["aparicao", "20A"],
    ],
  );
  assert.ok(
    content
      .find((system) => system.id === "changeling")
      .sections.every((section) => section.edition === "20º aniversário"),
  );
});

test("todas as áreas têm entradas localizáveis e referências a PDFs consultados", () => {
  for (const system of content) {
    assert.deepEqual(
      [...new Set(system.sections.map((section) => section.category))].sort(),
      ["lore", "mechanics", "sheet"],
    );
    assert.equal(
      new Set(system.sections.map((section) => section.id)).size,
      system.sections.length,
    );
    for (const section of system.sections) {
      assert.match(section.id, /^[a-z0-9-]+$/);
      assert.ok(
        section.title &&
          section.group &&
          section.body &&
          section.status &&
          section.source,
      );
      assert.doesNotMatch(section.body, /lorem ipsum/i);
      const source = sourcesById.get(section.sourceId);
      assert.ok(source, section.id);
      assert.equal(source.system, system.id);
      assert.equal(
        source.status,
        "lido",
        "entrada não pode atribuir texto a livro inacessível",
      );
      for (const number of section.pages.match(/\d+/g) || []) {
        assert.ok(
          Number(number) > 0 && Number(number) <= source.pages,
          `${section.id}: página ${number}`,
        );
      }
    }
  }
});

test("campos das fichas são definições sem valores de personagens e IDs únicos", () => {
  for (const system of content) {
    const fields = system.sheet.groups.flatMap((group) => group.fields);
    assert.equal(new Set(fields.map((field) => field.id)).size, fields.length);
    assert.ok(fields.length > 40);
    assert.ok(
      fields.every(
        (field) => !("value" in field) && !("defaultValue" in field),
      ),
    );
    assert.ok(
      system.sheet.groups.some((group) => group.title === "Antecedentes"),
    );
    for (const name of ["Talentos", "Perícias", "Conhecimentos"]) {
      if (["changeling", "mago", "aparicao"].includes(system.id))
        assert.ok(system.sheet.groups.some((group) => group.title === name));
    }
  }
});

test("guia de Imbuídos permanece separado das entradas H5", () => {
  const hunter = content.find((system) => system.id === "cacador");
  const legacy = hunter.sections.filter(
    (section) => section.sourceId === "hunter-legacy",
  );
  assert.ok(legacy.length > 0);
  assert.ok(legacy.every((section) => section.edition.includes("não é 5E")));
  const pending = sources.filter((source) => source.status === "pendente");
  assert.deepEqual(pending.map((source) => source.system).sort(), [
    "aparicao",
    "cacador",
    "changeling",
    "mago",
  ]);
});

test("Changeling mantém as 19 Artes e os 95 truques por nível", () => {
  const changeling = content.find((system) => system.id === "changeling");
  const arts = changeling.sections.filter(
    (section) => section.group === "Artes",
  );
  const tricks = changeling.sections.filter((section) =>
    section.group.startsWith("Truques — "),
  );
  assert.equal(arts.length, 19);
  assert.equal(tricks.length, 95);
  for (const group of new Set(tricks.map((section) => section.group))) {
    assert.deepEqual(
      tricks
        .filter((section) => section.group === group)
        .map((section) => section.title[0]),
      ["1", "2", "3", "4", "5"],
    );
  }
});
