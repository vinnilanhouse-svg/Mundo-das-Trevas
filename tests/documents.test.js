import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  documents,
  citedPages,
  searchPages,
  loadDocument,
} from "../src/document-data.js";

const sources = JSON.parse(
  readFileSync(new URL("../src/sources.json", import.meta.url)),
);
const asset = (url) =>
  readFileSync(new URL(`../public${url}`, import.meta.url));

test("13 documentos preservam todas as 2.207 páginas e seus PDFs originais", () => {
  assert.equal(documents.length, 13);
  assert.equal(
    documents.reduce((total, document) => total + document.pages, 0),
    2207,
  );
  assert.equal(
    new Set(documents.map((document) => document.sourceId)).size,
    documents.length,
  );
  for (const document of documents) {
    const source = sources.find((source) => source.id === document.sourceId);
    assert.equal(source.status, "lido");
    assert.equal(source.pages, document.pages);
    assert.equal(source.system, document.system);
    assert.ok(
      !source.type.includes("ficha"),
      "fichas preenchidas não podem ser publicadas",
    );
    const data = JSON.parse(asset(document.textUrl));
    assert.equal(data.sourceId, document.sourceId);
    assert.equal(data.pages.length, document.pages);
    data.pages.forEach((page, index) => {
      assert.equal(page.number, index + 1);
      assert.equal(typeof page.text, "string");
      assert.ok(["native", "ocr"].includes(page.method));
    });
    assert.equal(
      data.pages.filter((page) => page.method === "ocr").length,
      document.ocrPages,
    );
    assert.equal(
      data.pages.filter((page) => !page.text.trim()).length,
      document.emptyPages,
    );
    assert.ok(
      document.outline.every(
        (entry) => entry.page > 0 && entry.page <= document.pages,
      ),
    );
    const original = asset(document.pdfUrl);
    assert.equal(original.subarray(0, 5).toString(), "%PDF-");
    assert.equal(
      createHash("sha256").update(original).digest("hex"),
      document.originalSha256,
    );
  }
});

test("Caçador só publica o último básico e Mago continua sem livro inventado", () => {
  assert.deepEqual(
    documents
      .filter((document) => document.system === "cacador")
      .map((document) => document.sourceId),
    ["h5-core"],
  );
  assert.ok(!documents.some((document) => document.system === "mago"));
  const hunter = documents.find((document) => document.sourceId === "h5-core");
  assert.equal(hunter.method, "ocr");
  const data = JSON.parse(asset(hunter.textUrl));
  assert.ok(data.pages.every((page) => page.method === "ocr"));
  assert.match(
    data.pages[128].text,
    /rerrolar Dados de Desespero|rertolar Dados de Desespero/,
  );
});

test("referências aceitam intervalos, páginas avulsas e limites do documento", () => {
  assert.deepEqual(
    citedPages("1–3; 3; 8—10; 15-20", 17),
    [1, 2, 3, 8, 9, 10, 15, 16, 17],
  );
  assert.deepEqual(citedPages("0; 999; texto sem páginas", 20), []);
  assert.deepEqual(citedPages("5–2", 20), []);
});

test("busca recupera o texto integral sem depender de acentos ou quebras de linha", () => {
  const pages = [
    { number: 1, text: "Acesso\nGlobal e informação sobre Ímpeto." },
    { number: 2, text: "Texto diferente" },
  ];
  assert.deepEqual(
    searchPages(pages, "acesso global").map((page) => page.number),
    [1],
  );
  assert.deepEqual(
    searchPages(pages, "impeto").map((page) => page.number),
    [1],
  );
  assert.match(searchPages(pages, "informacao")[0].excerpt, /informação/);
  assert.deepEqual(searchPages(pages, "  "), []);
  assert.deepEqual(searchPages(pages, "ausente"), []);
});

test("falha de rede permite nova tentativa e o texto carregado é reutilizado", async (context) => {
  let calls = 0;
  const document = documents.find(
    (document) => document.sourceId === "c-houses",
  );
  const data = JSON.parse(asset(document.textUrl));
  context.mock.method(globalThis, "fetch", async () => {
    calls++;
    if (calls === 1) return { ok: false };
    return { ok: true, json: async () => data };
  });
  await assert.rejects(loadDocument("c-houses"), /carregar/);
  assert.equal(await loadDocument("c-houses"), data);
  assert.equal(await loadDocument("c-houses"), data);
  assert.equal(calls, 2);
  await assert.rejects(loadDocument("hunter-legacy"), /indisponível/);
});
