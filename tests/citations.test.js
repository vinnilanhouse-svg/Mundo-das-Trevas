import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { citedPages } from "../src/document-data.js";

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const content = read("../src/content.json");
const documents = read("../src/documents.json");
const citations = read("../src/translated-citations.json");
const normalize = (text) =>
  text
    .replace(/(\w)-\s*\n\s*(\w)/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();

test("todo tópico com fonte em inglês oferece uma citação traduzida identificada", () => {
  const englishSources = documents.filter(
    (document) => document.language === "en",
  );
  const topics = content
    .flatMap((system) => system.sections)
    .filter((section) =>
      englishSources.some((source) => source.sourceId === section.sourceId),
    );
  assert.equal(citations.length, topics.length);
  assert.equal(
    new Set(citations.map((citation) => citation.id)).size,
    citations.length,
  );
  for (const topic of topics) {
    const citation = citations.find((citation) => citation.id === topic.id);
    assert.ok(citation, topic.id);
    assert.equal(citation.sourceId, topic.sourceId);
    assert.equal(citation.language, "pt-BR");
    assert.equal(citation.originalLanguage, "en");
    assert.ok(citation.translation.length >= 20);
    assert.notEqual(citation.translation, citation.original);
    assert.match(citation.status, /não é tradução oficial/);
    assert.doesNotMatch(
      citation.translation,
      /\b(the|with|which|character’s)\b/i,
    );
  }
});

test("citações conservam o trecho original e uma página citada no tópico", () => {
  const texts = new Map(
    documents
      .filter((document) => document.language === "en")
      .map((document) => [
        document.sourceId,
        read(`../public${document.textUrl}`).pages,
      ]),
  );
  for (const citation of citations) {
    const topic = content
      .flatMap((system) => system.sections)
      .find(
        (section) =>
          section.id === citation.id && section.sourceId === citation.sourceId,
      );
    const pages = texts.get(citation.sourceId);
    assert.ok(
      citedPages(topic.pages, pages.length).includes(citation.page),
      `${citation.id}: página deve pertencer à referência do tópico`,
    );
    assert.ok(
      normalize(pages[citation.page - 1].text).includes(citation.original),
      `${citation.id}: trecho deve existir na página original`,
    );
  }
});

test("traduções das regras preservam limites e distinguem custos quiméricos e Fatídicos", () => {
  const quote = (id) =>
    citations.find((citation) => citation.id === id).translation;
  assert.match(
    quote("mechanics-magia-feerica-custos-que-exigem-conferencia"),
    /quiméricos não exigem/,
  );
  assert.match(
    quote("mechanics-magia-feerica-custos-que-exigem-conferencia"),
    /Fatídicos exigem.*um ponto/,
  );
  assert.match(
    quote("mechanics-magia-feerica-dados-de-pesadelo"),
    /sem ultrapassar o tamanho da parada/,
  );
  assert.match(
    quote("mechanics-regras-basicas-especializacoes"),
    /“10”.*dois sucessos em vez de um/,
  );
});
