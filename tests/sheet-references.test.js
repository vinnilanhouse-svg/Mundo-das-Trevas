import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSheetReferences } from "../src/sheet-references.js";
import { getSheetLayout } from "../src/sheet-layout.js";
import { groupHref, routeGroup } from "../src/library-routes.js";
const systems = JSON.parse(
  readFileSync(new URL("../src/content.json", import.meta.url)),
);
function valid(system, reference) {
  assert.ok(reference, system.id);
  const parts = reference.href.split("/");
  assert.equal(parts[2], system.id);
  if (parts[4] === "categoria")
    assert.ok(
      routeGroup(
        reference.href,
        system.sections.filter(
          (s) =>
            ({ mechanics: "mecanica", lore: "lore", sheet: "ficha" })[
              s.category
            ] === parts[3],
        ),
      ),
    );
  else
    assert.ok(
      system.sections.some(
        (s) =>
          s.id === parts[4] &&
          { mechanics: "mecanica", lore: "lore", sheet: "ficha" }[
            s.category
          ] === parts[3],
      ),
      reference.href,
    );
}
test("todos os nomes e títulos das cinco fichas apontam para conteúdo existente do próprio sistema", () => {
  for (const system of systems) {
    const refs = createSheetReferences(system),
      layout = getSheetLayout(system);
    for (const page of layout.pages)
      for (const section of page.sections) {
        valid(system, refs.heading(section.title));
        for (const column of section.columns)
          for (const block of column) {
            if (block.title)
              valid(
                system,
                refs.blockReference(block.title, block.fields, section.title),
              );
            for (const field of block.fields)
              valid(system, refs.field(field, block.title, section.title));
          }
      }
  }
});
test("Esferas vão ao próprio tópico; Artes abrem a categoria com os nomes", () => {
  const mage = systems.find((s) => s.id === "mago"),
    c20 = systems.find((s) => s.id === "changeling");
  const sphere = mage.sheet.groups
    .find((g) => g.title === "Esferas")
    .fields.find((f) => f.label === "Correspondência");
  assert.equal(
    createSheetReferences(mage).field(sphere).href,
    "#/sistema/mago/mecanica/mechanics-esferas-correspondencia",
  );
  const arts = createSheetReferences(c20).heading("Artes");
  assert.equal(arts.href, groupHref("changeling", "mechanics", "Artes"));
  assert.equal(routeGroup(arts.href, c20.sections), "Artes");
  const skill = c20.sheet.groups
    .find((g) => g.title === "Talentos")
    .fields.find((f) => f.label === "Briga");
  const ref = createSheetReferences(c20).field(skill);
  assert.equal(c20.sections.find((s) => s.id === ref.id).title, "Briga");
});
test("categorias com acentos abrem por URL; codificação inválida e categorias ausentes são rejeitadas", () => {
  const mage = systems.find((s) => s.id === "mago");
  const href = groupHref("mago", "mechanics", "Antecedentes · texto integral");
  assert.equal(
    routeGroup(href, mage.sections),
    "Antecedentes · texto integral",
  );
  assert.equal(
    routeGroup("#/sistema/mago/mecanica/categoria/%E0%A4", mage.sections),
    null,
  );
  assert.equal(
    routeGroup(groupHref("mago", "mechanics", "Não existe"), mage.sections),
    null,
  );
});
test("nomes de poderes escritos nas anotações ganham referências sem mudar o texto salvo", () => {
  const c20 = systems.find((s) => s.id === "changeling"),
    refs = createSheetReferences(c20),
    field = c20.sheet.groups.find((g) => g.title === "Artes").fields[0];
  const value = "Talecraft 3 e Andanças 2";
  const links = refs.inNotes(field, value);
  assert.ok(links.some((l) => l.title.includes("Fabulomancia")));
  assert.ok(links.some((l) => l.title.includes("Andanças")));
  assert.equal(value, "Talecraft 3 e Andanças 2");
  for (const link of links) valid(c20, link);
  assert.deepEqual(refs.inNotes(field, "sem poderes conhecidos"), []);
});
