import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (name) =>
  JSON.parse(readFileSync(new URL(`../src/${name}.json`, import.meta.url)));
const content = read("content");
const documents = read("documents");
const powers = (id) =>
  content.find((s) => s.id === id).sections.filter((s) => s.power);
const power = (id, name) => powers(id).find((s) => s.title === name).power;
const notes = (p) => (p.rollNotes || []).map((n) => n.text).join("\n");
const flat = (s) => s.replace(/\s+/g, " ");

test("orientações de rolagem apontam para páginas existentes do próprio sistema", () => {
  for (const system of content) {
    for (const section of system.sections.filter((s) => s.power)) {
      assert.ok(section.power.roll.trim(), section.id);
      for (const note of section.power.rollNotes || []) {
        const document = documents.find((d) => d.sourceId === note.sourceId);
        assert.equal(document?.system, system.id, section.id);
        assert.ok(note.text && note.source && note.pages, section.id);
        for (const number of note.pages.match(/\d+/g)) {
          assert.ok(
            Number(number) >= 1 && Number(number) <= document.pages,
            section.id,
          );
        }
      }
    }
  }
});

test("Arcanoi preservam testes de ativação, ações adicionais e resistência", () => {
  const weather = power("aparicao", "1 · Visão do Clima");
  assert.match(weather.roll, /Percepção \+ Argos/);
  assert.match(flat(weather.rules), /Percepção \+ Argos \(dificuldade 6\)/);
  const wings = power("aparicao", "2 · Asas Fantasmas");
  assert.match(wings.roll, /Raciocínio \+ Argos/);
  assert.match(wings.roll, /Destreza \+ Esportes/);
  assert.match(flat(wings.rules), /Manobras complicadas.*critério do Narrador/);
  const illusion = power("aparicao", "4 · Fantasmagoria");
  for (const pool of [
    "Percepção + Phantasma",
    "Percepção + Consciência",
    "Destreza + Phantasma",
    "Força + Phantasma",
  ]) {
    assert.ok(illusion.roll.includes(pool), pool);
  }
  assert.match(flat(illusion.rules), /dificuldade 7/);
  for (const { power: p } of powers("aparicao")) {
    assert.ok(p.rules.length > 50);
    assert.match(notes(p), /Mortalha/);
  }
});

test("efeitos automáticos e testes herdados de W20 não recebem uma ativação genérica", () => {
  const passive = power("aparicao", "2 · Determinação do Viajante (Iniciada)");
  assert.match(passive.roll, /Nenhum teste/);
  assert.match(flat(passive.rules), /não requer qualquer teste/);
  const preparation = power("aparicao", "4 · Preparação (Iniciada)");
  assert.match(preparation.roll, /Arsenal/);
  assert.match(flat(notes(preparation)), /Inteligência \+ Modelar/);
  assert.match(flat(notes(preparation)), /Vigor \+ Modelar/);
  assert.match(
    power("aparicao", "1 · Sentir Filamentos").roll,
    /Percepção \+ Teia Vital/,
  );
  assert.doesNotMatch(
    power("aparicao", "1 · Sentir Filamentos").roll,
    /Teia \/ /,
  );
});

test("truques distinguem conjuração 20A de testes adicionais", () => {
  for (const { power: p } of powers("changeling")) {
    assert.match(p.roll, /menor Alçada primária/);
    assert.match(notes(p), /dificuldade inicial 8/);
    assert.match(notes(p), /Cena e Tempo.*não somam dados/);
    assert.match(notes(p), /Pesadelo/);
  }
  const hop = power("changeling", "1 · Amarelinha");
  assert.match(flat(hop.rules), /Força \+ Esportes.*dificuldade 7/);
  assert.doesNotMatch(hop.roll, /Força \+ Esportes/);
});

test("Esferas usam Arete e Mente conserva suas dificuldades e resistências específicas", () => {
  for (const { power: p } of powers("mago")) {
    assert.match(p.roll, /Arete\/Iluminação/);
    for (const term of ["+ 3", "+ 4", "+ 5"]) assert.ok(p.roll.includes(term));
    assert.match(notes(p), /nível 3: dificuldade base 6.*7.*8/);
    if (p.family === "Mente") {
      assert.match(notes(p), /Força de Vontade do alvo \+ 3/);
      assert.match(notes(p), /múltiplos alvos/);
    }
  }
});

test("V5 e H5 distinguem procedimentos de base e condições particulares", () => {
  const vampire = powers("vampiro");
  const familiar = vampire.find((s) =>
    s.title.toLowerCase().includes("famulus enlaçado"),
  ).power;
  assert.match(notes(familiar), /Carisma \+ Empatia com animais \(Dif\. 2\)/);
  for (const { power: p } of vampire.filter(
    (s) => s.power.branch === "Ritual",
  )) {
    assert.match(notes(p), /Inteligência \+ Feitiçaria de Sangue/);
    assert.ok(notes(p).includes(`(${p.level + 1} para este nível)`));
    assert.match(notes(p), /regra específica.*prioridade/);
  }
  const access = power("cacador", "Grande Irmão Vigilante");
  assert.match(notes(access), /Inteligência \+ Tecnologia/);
  assert.match(notes(access), /Dificuldade 4/);
  assert.equal(access.rollNotes[0].sourceId, "h5-core");
});
