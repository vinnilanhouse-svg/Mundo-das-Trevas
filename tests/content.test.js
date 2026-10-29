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

test("Caçador usa exclusivamente o último básico H5 recebido", () => {
  const hunter = content.find((system) => system.id === "cacador");
  assert.deepEqual(hunter.sources, ["h5-core"]);
  assert.ok(hunter.sections.every((section) => section.sourceId === "h5-core"));
  assert.ok(
    hunter.sections.every((section) => section.edition === "5ª edição"),
  );
  assert.deepEqual(
    sources
      .filter((source) => source.system === "cacador")
      .map((source) => source.id),
    ["h5-core"],
  );
  assert.deepEqual(
    sources
      .filter((source) => source.status === "pendente")
      .map((source) => source.system),
    ["mago"],
  );
  assert.equal(sourcesById.get("h5-core").pages, 288);
  for (const kind of ["físicas", "sociais", "mentais"]) {
    assert.equal(
      hunter.sections.filter(
        (section) => section.group === `Habilidades ${kind}`,
      ).length,
      9,
    );
  }
  for (const kind of ["físicos", "sociais", "mentais"]) {
    assert.equal(
      hunter.sections.filter((section) => section.group === `Atributos ${kind}`)
        .length,
      3,
    );
  }
  for (const edge of hunter.sections.filter(
    (section) => section.power?.branch === "Trunfo",
  )) {
    const perks = hunter.sections.filter(
      (section) =>
        section.power?.branch === "Distinção" &&
        section.power.family === edge.power.family,
    );
    assert.equal(perks.length, edge.title === "Jóquei de Drones" ? 5 : 4);
  }
  assert.equal(
    hunter.sections.filter((section) => section.group === "Credos").length,
    5,
  );
  assert.equal(
    hunter.sections.filter((section) => section.group === "Ímpetos e Redenção")
      .length,
    7,
  );
  assert.equal(
    hunter.sections.filter((section) => section.power?.branch === "Trunfo")
      .length,
    12,
  );
  assert.equal(
    hunter.sections.filter((section) => section.power?.branch === "Distinção")
      .length,
    49,
  );
  assert.ok(
    hunter.sections
      .filter((section) => section.power)
      .every((section) => section.power.level === null),
  );
  const state = hunter.sheet.groups.find(
    (group) => group.title === "Estado da célula",
  );
  assert.deepEqual(
    state.fields.map((field) => field.id),
    ["celula-desespero", "celula-perigo"],
  );
  assert.equal(state.fields[0].max, 5);
  assert.ok(
    hunter.sheet.groups.find((group) => group.title === "Aflição e Redenção")
      ?.kind === "notes",
  );
  assert.ok(
    !hunter.sheet.groups
      .flatMap((group) => group.fields)
      .some((field) => field.id === "trilhas-aflicao"),
  );
  assert.match(
    hunter.sections.find(
      (section) => section.title === "Dados de Desespero — procedimento",
    ).body,
    /não pode rerrolar|não podem rerrolar/,
  );
  assert.match(
    hunter.sections.find((section) => section.title === "Aflição e Redenção")
      .body,
    /Não é uma trilha/,
  );
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

test("livros recebidos no ZIP têm referências ativas e artes W20 completas por nível", () => {
  assert.equal(sourcesById.get("c20-core").status, "lido");
  assert.equal(sourcesById.get("c20-core").pages, 482);
  assert.equal(sourcesById.get("w20-core").status, "lido");
  assert.equal(sourcesById.get("w20-core").pages, 517);
  const wraith = content.find((system) => system.id === "aparicao");
  const groups = new Set(
    wraith.sections
      .filter(
        (section) =>
          section.group.startsWith("Arcanoi — ") &&
          section.group !== "Arcanoi — fundamentos",
      )
      .map((section) => section.group),
  );
  assert.equal(groups.size, 16);
  for (const group of groups) {
    const entries = wraith.sections.filter(
      (section) => section.group === group,
    );
    assert.equal(entries.length, 11);
    for (const branch of ["Comum", "Iniciada"]) {
      assert.deepEqual(
        entries
          .filter((section) => section.power?.branch === branch)
          .map((section) => section.power.level),
        [1, 2, 3, 4, 5],
      );
    }
    assert.ok(
      entries.some((section) => section.title === "Artes Iniciadas — índice"),
    );
  }
  const skills = Object.fromEntries(
    wraith.sheet.groups.map((group) => [
      group.title,
      group.fields.map((field) => field.label),
    ]),
  );
  assert.ok(skills.Talentos.includes("Persuasão"));
  assert.ok(!skills.Talentos.includes("Esquiva"));
  assert.ok(skills.Perícias.includes("Furto"));
  assert.ok(!skills.Perícias.includes("Reparos"));
  assert.ok(skills.Conhecimentos.includes("Acadêmicos"));
  assert.ok(skills.Conhecimentos.includes("Tecnologia"));
  assert.ok(
    wraith.sections.every((section) => section.sourceId === "w20-core"),
  );
});

test("poderes têm efeitos individuais, nível e fonte; sistemas pendentes não são inventados", () => {
  const expected = {
    vampiro: 575,
    changeling: 95,
    cacador: 61,
    mago: 0,
    aparicao: 160,
  };
  for (const system of content) {
    const powers = system.sections.filter((section) => section.power);
    assert.equal(powers.length, expected[system.id]);
    for (const section of powers) {
      const power = section.power;
      assert.ok(power.level === null || [1, 2, 3, 4, 5].includes(power.level));
      assert.ok(power.effect.length >= 20);
      assert.equal(section.body, power.effect);
      assert.ok(power.family && power.branch && power.source && power.pages);
      assert.equal(sourcesById.get(power.sourceId).status, "lido");
      assert.doesNotMatch(power.effect, /\[símbolo do PDF\]/);
      if (system.id === "changeling" || system.id === "aparicao")
        assert.ok(power.rules.length > 100);
      if (power.branch === "Poder ancestral" || power.branch === "Distinção")
        assert.equal(power.level, null);
    }
  }
  assert.equal(sourcesById.get("h5-core").status, "lido");
  assert.ok(
    content
      .find((system) => system.id === "mago")
      .sections.every((section) => !section.power),
  );
});

test("progressões distinguem alternativas de V5, duas trilhas de W20 e os cinco níveis de Talecraft", () => {
  const c20 = content.find((system) => system.id === "changeling");
  const tale = c20.sections.filter(
    (section) => section.power?.family === "Fabulomancia",
  );
  assert.deepEqual(
    tale.map((section) => section.power.level),
    [1, 2, 3, 4, 5],
  );
  assert.ok(tale.every((section) => section.power.rules.includes("Sistema")));
  const timeDilation = c20.sections.find(
    (section) =>
      section.power?.family === "Cronos" && section.power.level === 5,
  );
  assert.match(timeDilation.body, /envelhecer/);
  const vampire = content.find((system) => system.id === "vampiro");
  const animalism = vampire.sections.filter(
    (section) => section.power?.family === "Animalismo",
  );
  assert.deepEqual(
    [...new Set(animalism.map((section) => section.power.level))].sort(),
    [1, 2, 3, 4, 5],
  );
  assert.ok(
    animalism.filter((section) => section.power.level === 1).length > 1,
  );
  assert.ok(
    vampire.sections
      .filter((section) => section.power?.branch === "Fórmula")
      .every((section) => section.power.family === "Alquimia Sangue-Ralo"),
  );
});
