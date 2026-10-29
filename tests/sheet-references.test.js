import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSheetReferences } from "../src/sheet-references.js";
import { getSheetLayout } from "../src/sheet-layout.js";
import { groupHref, routeGroup } from "../src/library-routes.js";
const systems = JSON.parse(
  readFileSync(new URL("../src/content.json", import.meta.url)),
);
const documents = JSON.parse(
  readFileSync(new URL("../src/documents.json", import.meta.url)),
);
const system = (id) => systems.find((s) => s.id === id);
const definition = (sid, id) =>
  system(sid)
    .sheet.groups.flatMap((g) => g.fields)
    .find((f) => f.id === id);
const reference = (sid, id) =>
  createSheetReferences(system(sid)).field(definition(sid, id));
const article = (sid, ref) => system(sid).sections.find((s) => s.id === ref.id);
const sourceText = (ref) => {
  const document = documents.find((d) => d.sourceId === ref.sourceId);
  return JSON.parse(
    readFileSync(new URL(`../public${document.textUrl}`, import.meta.url)),
  ).pages[ref.page - 1].text;
};
function valid(s, ref) {
  assert.ok(ref);
  const parts = ref.href.split("/");
  assert.equal(parts[2], s.id);
  if (parts[3] === "documentos") {
    const doc = documents.find(
      (d) => d.sourceId === parts[4] && d.system === s.id,
    );
    assert.ok(doc);
    assert.ok(ref.page > 0 && ref.page <= doc.pages);
    assert.equal(Number(parts[5]), ref.page);
  } else if (parts[4] === "categoria")
    assert.ok(
      routeGroup(
        ref.href,
        s.sections.filter(
          (a) =>
            ({ mechanics: "mecanica", lore: "lore", sheet: "ficha" })[
              a.category
            ] === parts[3],
        ),
      ),
    );
  else
    assert.ok(
      s.sections.some(
        (a) =>
          a.id === parts[4] &&
          { mechanics: "mecanica", lore: "lore", sheet: "ficha" }[
            a.category
          ] === parts[3],
      ),
      ref.href,
    );
}
test("todos os 354 campos foram revisados; somente campos sem explicação correspondente ficam sem link", () => {
  const absent = {
    changeling: ["anotacoes-equipamento"],
    aparicao: [
      "qualidades-e-defeitos-qualidades-e-custos",
      "qualidades-e-defeitos-defeitos-e-custos",
    ],
  };
  let count = 0;
  for (const s of systems) {
    const refs = createSheetReferences(s),
      missing = [];
    for (const g of s.sheet.groups)
      for (const f of g.fields) {
        count++;
        const ref = refs.field(f);
        if (ref) valid(s, ref);
        else missing.push(f.id);
      }
    assert.deepEqual(missing, absent[s.id] || []);
    for (const page of getSheetLayout(s).pages)
      for (const section of page.sections) {
        const ref = refs.heading(section.title);
        if (ref) valid(s, ref);
        for (const column of section.columns)
          for (const block of column) {
            const target = refs.blockReference(
              block.title,
              block.fields,
              section.title,
            );
            if (target) valid(s, target);
          }
      }
  }
  assert.equal(count, 354);
});
test("todas as nove Esferas e seis Alçadas levam ao próprio poder, incluindo Vida e Natureza", () => {
  for (const [sid, name] of [
    ["mago", "Esferas"],
    ["changeling", "Alçadas"],
  ])
    for (const field of system(sid).sheet.groups.find((g) => g.title === name)
      .fields) {
      const ref = reference(sid, field.id);
      assert.equal(ref.kind, "article");
      const destination = article(sid, ref);
      assert.equal(destination.category, "mechanics");
      assert.equal(destination.group, name);
      assert.equal(destination.title, field.label);
    }
  assert.equal(
    reference("mago", "esferas-vida").href,
    "#/sistema/mago/mecanica/mechanics-esferas-vida",
  );
  assert.equal(
    article("aparicao", reference("aparicao", "identidade-vida")).title,
    "Vida, morte e motivo para permanecer",
  );
  assert.equal(
    reference("mago", "identidade-natureza").group,
    "Arquétipos · texto integral",
  );
});
test("Atributos e Habilidades respeitam a coluna e o sistema em vez de homônimos", () => {
  const c20Terms = {
    Força: "Strength",
    Destreza: "Dexterity",
    Vigor: "Stamina",
    Carisma: "Charisma",
    Manipulação: "Manipulation",
    Aparência: "Appearance",
    Percepção: "Perception",
    Inteligência: "Intelligence",
    Raciocínio: "Wits",
  };
  for (const s of systems)
    for (const group of s.sheet.groups) {
      if (group.title.startsWith("Atributos "))
        for (const field of group.fields) {
          const ref = reference(s.id, field.id);
          if (s.id === "changeling") {
            assert.equal(ref.sourceId, "c20-core");
            assert.ok(sourceText(ref).includes(c20Terms[field.label]));
          } else {
            const target = article(s.id, ref);
            assert.equal(target.category, "mechanics");
            assert.equal(
              s.id === "cacador" ? target.group : target.title,
              group.title,
            );
          }
        }
      if (
        ["Talentos", "Perícias", "Conhecimentos"].includes(group.title) ||
        group.title.startsWith("Habilidades ")
      )
        for (const field of group.fields) {
          const ref = reference(s.id, field.id);
          if (s.id === "mago")
            assert.equal(ref.group, `${group.title} · texto integral`);
          else {
            const target = article(s.id, ref);
            assert.equal(target.category, "mechanics");
            if (/amador|profissional|especializado/.test(field.label))
              assert.equal(target.group, "Habilidades — opções");
            else {
              assert.equal(target.title, field.label);
              assert.equal(
                target.group,
                group.title.startsWith("Habilidades ")
                  ? group.title
                  : `Habilidades — ${group.title}`,
              );
            }
          }
        }
    }
  const c20 = system("changeling"),
    mental = c20.sheet.groups.find((g) => g.title === "Atributos mentais");
  const ref = createSheetReferences(c20).blockReference(
    "Mentais",
    mental.fields,
    "Atributos",
  );
  assert.equal(ref.sourceId, "c20-core");
  assert.equal(ref.page, 161);
});
test("regressões de condições, identidade, recursos e equipamento têm destinos próprios", () => {
  const expected = [
    [
      "vampiro",
      "dano-e-condicoes-maculas-e-condicoes",
      "Humanidade, Convicções e Pilares",
    ],
    ["vampiro", "anotacoes-equipamento", "Vantagens e notas"],
    ["changeling", "identidade-aspecto", "Aspecto e fases da vida feérica"],
    ["cacador", "identidade-ambicao", "Ambição, Desejo e Pilares"],
    ["cacador", "identidade-desejo", "Ambição, Desejo e Pilares"],
    ["cacador", "identidade-redencao", "Aflição e Redenção"],
    [
      "mago",
      "pratica-e-anotacoes-vitalidade-e-condicoes",
      "Vitalidade e tipos de dano",
    ],
    ["aparicao", "anotacoes-equipamento", "Armadura e objetos"],
    ["aparicao", "sombra-espinhos-e-custos", "Espinhos"],
    ["aparicao", "sombra-guia-da-sombra", "Guia da Sombra"],
    ["aparicao", "trilhas-pathos", "Pathos e Força de Vontade"],
  ];
  for (const [sid, id, title] of expected)
    assert.equal(article(sid, reference(sid, id)).title, title, `${sid}/${id}`);
  assert.equal(
    reference("mago", "identidade-essencia").group,
    "Essências de Avatar · texto integral",
  );
  for (const id of [
    "temperamentos-reservas-forca-de-vontade-permanente",
    "temperamentos-reservas-forca-de-vontade-temporaria",
  ]) {
    const ref = reference("changeling", id);
    assert.equal(ref.page, 172);
    assert.ok(sourceText(ref).includes("Willpower"));
  }
  assert.ok(
    sourceText(reference("changeling", "natureza-feerica-antitese")).includes(
      "Antithesis",
    ),
  );
  assert.ok(
    sourceText(
      reference(
        "changeling",
        "natureza-feerica-limiar-de-inspiracao-exterminio",
      ),
    ).includes("Musing Threshold"),
  );
  assert.ok(
    sourceText(
      reference("mago", "qualidades-e-defeitos-qualidades-e-custos"),
    ).includes("Qualidades e Defeitos"),
  );
});
test("nomes iguais em outros contextos e campos novos não substituem o destino correto", () => {
  const mage = structuredClone(system("mago"));
  mage.sections.unshift({
    ...mage.sections[0],
    id: "fake-vida",
    title: "Vida",
    category: "mechanics",
    group: "Identidade",
  });
  const refs = createSheetReferences(mage);
  assert.equal(
    refs.field(definition("mago", "esferas-vida")).id,
    "mechanics-esferas-vida",
  );
  assert.equal(refs.field({ id: "campo-novo-vida", label: "Vida" }), null);
  assert.equal(refs.heading("Campo ainda não mapeado"), null);
  mage.sections = mage.sections.filter(
    (a) => a.id !== "mechanics-esferas-vida",
  );
  assert.equal(
    createSheetReferences(mage).field(definition("mago", "esferas-vida")),
    null,
  );
});
test("categorias e atalhos de poderes nas anotações continuam corretos", () => {
  const c20 = system("changeling"),
    refs = createSheetReferences(c20);
  assert.equal(
    refs.heading("Artes").href,
    groupHref("changeling", "mechanics", "Artes"),
  );
  assert.equal(routeGroup(refs.heading("Artes").href, c20.sections), "Artes");
  const field = c20.sheet.groups.find((g) => g.title === "Artes").fields[0],
    value = "Talecraft 3 e Andanças 2";
  const links = refs.inNotes(field, value);
  assert.ok(links.some((l) => l.title.includes("Fabulomancia")));
  assert.ok(links.some((l) => l.title.includes("Andanças")));
  assert.equal(value, "Talecraft 3 e Andanças 2");
  for (const link of links) valid(c20, link);
  assert.equal(
    routeGroup(
      "#/sistema/mago/mecanica/categoria/%E0%A4",
      system("mago").sections,
    ),
    null,
  );
});
