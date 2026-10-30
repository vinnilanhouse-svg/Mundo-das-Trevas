import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CONSENT_KEY,
  CONSENT_LIFETIME,
  PRIVACY_VERSION,
  analyticsAllowed,
  createPrivacyChoice,
  validPrivacyChoice,
  readPrivacyChoice,
  storePrivacyChoice,
} from "../src/privacy.js";
import { createAnalyticsRoutes } from "../src/analytics-routes.js";
import { articleHref, groupHref } from "../src/library-routes.js";
const systems = JSON.parse(
  readFileSync(new URL("../src/content.json", import.meta.url)),
);
const documents = JSON.parse(
  readFileSync(new URL("../src/documents.json", import.meta.url)),
);
const now = Date.UTC(2026, 9, 30);

function storage() {
  const values = new Map();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("estatísticas começam desligadas e dados ausentes ou inválidos não autorizam coleta", () => {
  const data = storage();
  assert.equal(readPrivacyChoice(data, now), null);
  assert.equal(analyticsAllowed(null, now), false);
  for (const raw of [
    "{",
    "null",
    "true",
    "{}",
    JSON.stringify({ analytics: true }),
  ]) {
    data.setItem(CONSENT_KEY, raw);
    assert.equal(readPrivacyChoice(data, now), null);
  }
});

test("aceite e recusa são explícitos; escolha vence em 180 dias ou ao mudar a política", () => {
  const accepted = createPrivacyChoice(true, now);
  const refused = createPrivacyChoice(false, now);
  assert.equal(accepted.version, PRIVACY_VERSION);
  assert.equal(analyticsAllowed(accepted, now), true);
  assert.equal(analyticsAllowed(refused, now), false);
  assert.equal(validPrivacyChoice(refused, now), true);
  assert.equal(analyticsAllowed(accepted, now + CONSENT_LIFETIME - 1), true);
  assert.equal(analyticsAllowed(accepted, now + CONSENT_LIFETIME), false);
  for (const invalid of [
    { ...accepted, version: "antiga" },
    { ...accepted, analytics: "true" },
    { ...accepted, necessary: false },
    { ...accepted, decidedAt: now + 1 },
    { ...accepted, expiresAt: accepted.expiresAt + 1 },
  ])
    assert.equal(analyticsAllowed(invalid, now), false);
  assert.equal(createPrivacyChoice("true", now).analytics, false);
});

test("preferências não apagam fichas e armazenamento bloqueado falha sem autorizar medição", () => {
  const data = storage();
  data.setItem("arquivo-trevas-sheet-v1-mago", "ficha privada");
  assert.equal(storePrivacyChoice(data, createPrivacyChoice(true, now)), true);
  assert.equal(analyticsAllowed(readPrivacyChoice(data, now), now), true);
  storePrivacyChoice(data, createPrivacyChoice(false, now));
  assert.equal(readPrivacyChoice(data, now).analytics, false);
  assert.equal(data.getItem("arquivo-trevas-sheet-v1-mago"), "ficha privada");
  const blocked = {
    getItem() {
      throw Error("bloqueado");
    },
    setItem() {
      throw Error("bloqueado");
    },
  };
  assert.equal(readPrivacyChoice(blocked, now), null);
  assert.equal(
    storePrivacyChoice(blocked, createPrivacyChoice(true, now)),
    false,
  );
});

test("rotas com fragmentos distinguem todos os sistemas, áreas, categorias e tópicos públicos", () => {
  const routes = createAnalyticsRoutes(systems, documents);
  assert.equal(routes.pathFor(""), "/");
  assert.equal(routes.pathFor("#/privacidade"), "/privacidade");
  for (const system of systems) {
    assert.equal(
      routes.pathFor(`#/sistema/${system.id}`),
      `/sistema/${system.id}`,
    );
    for (const entry of system.sections) {
      assert.ok(routes.pathFor(articleHref(system.id, entry)));
      assert.ok(
        routes.pathFor(groupHref(system.id, entry.category, entry.group)),
      );
    }
  }
  const arts = routes.pathFor(groupHref("changeling", "mechanics", "Artes"));
  assert.equal(arts, "/sistema/changeling/mecanica/categoria/Artes");
});

test("páginas de livros são agrupadas por documento validado; URLs arbitrárias são descartadas", () => {
  const routes = createAnalyticsRoutes(systems, documents);
  for (const book of documents) {
    const base = `#/sistema/${book.system}/documentos/${book.sourceId}`;
    assert.equal(routes.pathFor(`${base}/1`), base.slice(1));
    assert.equal(routes.pathFor(`${base}/${book.pages}`), base.slice(1));
    assert.equal(routes.pathFor(`${base}/${book.pages + 1}`), null);
  }
  for (const hash of [
    "#/busca/email@example.com",
    "#/sistema/mago/ficha?nome=Pessoa",
    "#/sistema/invalido",
    "#/sistema/mago/documentos/ficha-privada/1",
    "#/%E0%A4%A",
    null,
  ])
    assert.equal(routes.pathFor(hash), null);
});

test("envio aceita só páginas conhecidas e remove parâmetros, fragmentos e eventos de conteúdo privado", () => {
  const routes = createAnalyticsRoutes(systems, documents);
  const origin = "https://acervo.example";
  assert.deepEqual(
    routes.cleanEvent(
      {
        type: "pageview",
        url: `${origin}/sistema/mago/ficha?nome=Pessoa#segredo`,
      },
      origin,
    ),
    { type: "pageview", url: `${origin}/sistema/mago/ficha` },
  );
  assert.equal(
    routes.cleanEvent(
      { type: "event", url: `${origin}/`, name: "Busca", data: "privado" },
      origin,
    ),
    null,
  );
  assert.equal(
    routes.cleanEvent(
      { type: "pageview", url: "https://outro.example/" },
      origin,
    ),
    null,
  );
  assert.equal(
    routes.cleanEvent(
      { type: "pageview", url: `${origin}/ficha-de-pessoa` },
      origin,
    ),
    null,
  );
});
