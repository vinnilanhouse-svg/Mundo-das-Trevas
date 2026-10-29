import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getSheetLayout } from "../src/sheet-layout.js";
const systems = JSON.parse(
  readFileSync(new URL("../src/content.json", import.meta.url)),
);
const fieldsOf = (section) =>
  section.columns.flatMap((column) => column.flatMap((block) => block.fields));
const allFields = (layout) =>
  layout.pages.flatMap((page) => page.sections.flatMap(fieldsOf));

test("os cinco modelos mantêm cada campo e seu tipo uma única vez, sem alterar as definições", () => {
  for (const system of systems) {
    const before = JSON.stringify(system.sheet);
    const layout = getSheetLayout(system);
    const fields = allFields(layout);
    const original = system.sheet.groups.flatMap((g) =>
      g.fields.map((f) => ({ ...f, kind: g.kind })),
    );
    assert.equal(layout.pages.length, 2);
    assert.deepEqual(
      fields.map((f) => f.id).sort(),
      original.map((f) => f.id).sort(),
    );
    assert.equal(new Set(fields.map((f) => f.id)).size, fields.length);
    for (const field of fields)
      assert.deepEqual(
        field,
        original.find((f) => f.id === field.id),
      );
    assert.equal(JSON.stringify(system.sheet), before);
    assert.ok(
      !layout.pages.some((p) =>
        p.sections.some((s) => s.title === "Campos complementares"),
      ),
    );
  }
});
test("Atributos e Habilidades conservam as três colunas dos formulários", () => {
  for (const system of systems) {
    const sections = getSheetLayout(system).pages[0].sections;
    for (const name of ["Atributos", "Habilidades"]) {
      const section = sections.find((s) => s.title === name);
      assert.equal(section.columns.length, 3);
      assert.ok(section.columns.every((column) => column.length === 1));
    }
    const attrs = sections.find((s) => s.title === "Atributos");
    assert.deepEqual(
      attrs.columns.map((c) => c[0].title),
      ["Físicos", "Sociais", "Mentais"],
    );
  }
});
test("V5 e H5 posicionam as trilhas antes das Habilidades, com poderes abaixo", () => {
  for (const id of ["vampiro", "cacador"]) {
    const sections = getSheetLayout(systems.find((s) => s.id === id)).pages[0]
      .sections;
    const attrs = sections.findIndex((s) => s.title === "Atributos"),
      skills = sections.findIndex((s) => s.title === "Habilidades");
    assert.equal(skills, attrs + 2);
    assert.match(sections[attrs + 1].title, /Vitalidade/);
    assert.equal(
      sections[skills + 1].title,
      id === "vampiro" ? "Disciplinas" : "Trunfos e Distinções",
    );
  }
});
test("Mago reúne as Esferas em três colunas e Aparição separa a Sombra", () => {
  const mage = getSheetLayout(systems.find((s) => s.id === "mago"));
  const spheres = mage.pages[0].sections.find((s) => s.title === "Esferas");
  assert.deepEqual(
    spheres.columns.map((c) => c[0].fields.map((f) => f.label)),
    [
      ["Correspondência", "Entropia", "Espírito"],
      ["Forças", "Matéria", "Mente"],
      ["Primórdio", "Tempo", "Vida"],
    ],
  );
  const wraith = getSheetLayout(systems.find((s) => s.id === "aparicao"));
  assert.equal(wraith.pages[0].title, "Psique");
  assert.match(wraith.pages[1].title, /Sombra/);
  assert.ok(
    wraith.pages[1].sections.some((s) =>
      fieldsOf(s).some((f) => f.id === "sombra-espinhos-e-custos"),
    ),
  );
  assert.ok(
    !wraith.pages[0].sections.some((s) =>
      fieldsOf(s).some((f) => f.id === "sombra-espinhos-e-custos"),
    ),
  );
});
test("campos novos continuam visíveis mesmo quando não constam do mapa da ficha", () => {
  const system = structuredClone(systems[0]);
  system.sheet.groups.push({
    title: "Complemento",
    kind: "text",
    fields: [{ id: "complemento-teste", label: "Campo adicional", max: 5 }],
  });
  const layout = getSheetLayout(system);
  assert.ok(allFields(layout).some((f) => f.id === "complemento-teste"));
  assert.equal(
    layout.pages.at(-1).sections.at(-1).title,
    "Campos complementares",
  );
});
