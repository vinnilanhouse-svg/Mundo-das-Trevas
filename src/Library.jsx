import React, { useEffect, useRef, useState } from "react";
import sources from "./sources.json";

const categories = [
  {
    id: "lore",
    key: "lore",
    name: "Lore",
    description: "Mundo, sociedade, facções e identidades.",
  },
  {
    id: "mecanica",
    key: "mechanics",
    name: "Mecânica",
    description: "Atributos, habilidades, antecedentes, poderes e regras.",
  },
  {
    id: "ficha",
    key: "sheet",
    name: "Ficha",
    description: "Modelo vazio, campos separados e anotações da personagem.",
  },
];
const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function SystemLabel({ system }) {
  return (
    <>
      {system.name}{" "}
      <small className="edition-badge">{system.editionLabel}</small>
    </>
  );
}

export function validateLibrary(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 100 &&
    new Set(value.map((s) => s?.id)).size === value.length &&
    value.every(
      (s) =>
        s &&
        typeof s.id === "string" &&
        /^[a-z0-9-]+$/.test(s.id) &&
        [
          "name",
          "subtitle",
          "original",
          "description",
          "kind",
          "year",
          "theme",
          "editionLabel",
          "coverage",
        ].every((k) => typeof s[k] === "string") &&
        Array.isArray(s.editions) &&
        s.editions.length > 0 &&
        s.editions.every((e) => typeof e === "string") &&
        Array.isArray(s.sources) &&
        s.sources.every((id) => sources.some((source) => source.id === id)) &&
        Array.isArray(s.sections) &&
        s.sections.length > 0 &&
        new Set(s.sections.map((a) => a?.id)).size === s.sections.length &&
        s.sections.every(
          (a) =>
            a &&
            [
              "id",
              "title",
              "intro",
              "body",
              "edition",
              "source",
              "group",
              "status",
            ].every((k) => typeof a[k] === "string") &&
            /^[a-z0-9-]+$/.test(a.id) &&
            ["lore", "mechanics", "sheet"].includes(a.category) &&
            sources.some((source) => source.id === a.sourceId),
        ) &&
        s.sheet &&
        typeof s.sheet.notice === "string" &&
        Array.isArray(s.sheet.groups) &&
        s.sheet.groups.length > 0 &&
        s.sheet.groups.every(
          (g) =>
            g &&
            typeof g.title === "string" &&
            ["text", "rating", "number", "notes"].includes(g.kind) &&
            Array.isArray(g.fields) &&
            g.fields.length > 0 &&
            g.fields.every(
              (f) =>
                f &&
                typeof f.label === "string" &&
                typeof f.id === "string" &&
                /^[a-z0-9-]+$/.test(f.id) &&
                Number.isInteger(f.max) &&
                f.max > 0 &&
                f.max <= 10000,
            ),
        ) &&
        new Set(s.sheet.groups.flatMap((g) => g.fields.map((f) => f.id)))
          .size === s.sheet.groups.reduce((n, g) => n + g.fields.length, 0),
    )
  );
}

export function SystemLibrary({ system, route, favorite, onFavorite, onEdit }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const base = `#/sistema/${system.id}`;
  const categorySlug = route.split("/")[3];
  const sectionSlug = route.split("/")[4];
  const category = categories.find((c) => c.id === categorySlug);
  const sections = category
    ? system.sections.filter((s) => s.category === category.key)
    : [];
  const groups = [...new Set(sections.map((s) => s.group))];
  const filtered = sections.filter(
    (s) =>
      (group === "all" || s.group === group) &&
      normalize(`${s.title} ${s.body} ${s.group} ${s.edition}`).includes(
        normalize(query),
      ),
  );
  const article = sections.find((s) => s.id === sectionSlug);
  useEffect(() => {
    setQuery("");
    setGroup("all");
  }, [categorySlug, system.id]);
  return (
    <div className={`detail-page ${system.kind}`}>
      <a className="back-link" href={categorySlug ? base : "#"}>
        ← {categorySlug ? "Voltar às áreas do sistema" : "Voltar ao acervo"}
      </a>
      <section className="detail-hero library-hero">
        <div>
          <div className="eyebrow">WORLD OF DARKNESS / {system.original}</div>
          <h1>
            <SystemLabel system={system} />
            <span>{system.subtitle}</span>
          </h1>
          <p>{system.description}</p>
        </div>
      </section>
      <div className="detail-tools">
        <span>
          {system.sections.length} entradas · {system.editions.join(", ")}
        </span>
        <button className="text-button" onClick={onFavorite}>
          {favorite ? "★ Remover dos favoritos" : "☆ Salvar nos favoritos"}
        </button>
      </div>
      <div className="notice">
        <span>
          <strong>Cobertura das fontes.</strong> {system.coverage}
        </span>
      </div>
      {!categorySlug ? (
        <>
          <div className="area-grid">
            {categories.map((c) => (
              <a className="area-card" href={`${base}/${c.id}`} key={c.id}>
                <span className="eyebrow">{c.name.toUpperCase()}</span>
                <h2>
                  {c.name} <span>→</span>
                </h2>
                <p>{c.description}</p>
                <small>
                  {system.sections.filter((s) => s.category === c.key).length}{" "}
                  entradas{c.key === "sheet" ? " + ficha preenchível" : ""}
                </small>
              </a>
            ))}
          </div>
          <SourceList system={system} />
        </>
      ) : !category ? (
        <div className="empty-state">
          <h2>Área não encontrada</h2>
          <p>Escolha Lore, Mecânica ou Ficha.</p>
          <a className="button" href={base}>
            Ver áreas do sistema
          </a>
        </div>
      ) : (
        <>
          <nav className="area-tabs" aria-label="Áreas do sistema">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`${base}/${c.id}`}
                aria-current={c.id === category.id ? "page" : undefined}
              >
                {c.name}
              </a>
            ))}
          </nav>
          <h2 className="library-heading">
            {category.name} — <SystemLabel system={system} />
          </h2>
          {category.key === "sheet" && <CharacterSheet system={system} />}
          <div className="library-filters">
            <label>
              Buscar nesta área
              <input
                aria-label="Buscar nesta área"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex.: antecedentes, Força de Vontade, Glamour…"
              />
            </label>
            <label>
              Categoria
              <select
                aria-label="Categoria"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="all">Todas as categorias</option>
                {groups.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="results-label" role="status">
            {filtered.length} entradas encontradas nesta área
          </div>
          <div className="library-layout">
            <nav className="library-index" aria-label="Tópicos da área">
              {groups
                .filter((g) => group === "all" || g === group)
                .map((g) => {
                  const items = filtered.filter((s) => s.group === g);
                  return items.length ? (
                    <section key={g}>
                      <h3>{g}</h3>
                      {items.map((s) => (
                        <a
                          href={`${base}/${category.id}/${s.id}`}
                          key={s.id}
                          aria-current={
                            article?.id === s.id ? "page" : undefined
                          }
                        >
                          {s.title}
                          <small>{s.edition}</small>
                        </a>
                      ))}
                    </section>
                  ) : null;
                })}
              {!filtered.length && <p>Nenhuma entrada com esses filtros.</p>}
            </nav>
            <article className="reading-content library-article">
              {sectionSlug && !article ? (
                <>
                  <h2>Tópico não encontrado</h2>
                  <p>Escolha uma entrada do índice desta área.</p>
                </>
              ) : article ? (
                <>
                  <div className="eyebrow">{article.group}</div>
                  <h2>{article.title}</h2>
                  <div className="article-meta">
                    <span>{article.edition}</span>
                    <span>{article.status}</span>
                  </div>
                  <div className="article-body">{article.body}</div>
                  <div className="source">
                    <span>
                      <strong>Fonte:</strong> {article.source}
                      <br />
                      <small>
                        {sources.find((s) => s.id === article.sourceId)?.note}
                      </small>
                    </span>
                  </div>
                  <button className="button" onClick={() => onEdit(article.id)}>
                    Editar conteúdo
                  </button>
                </>
              ) : (
                <>
                  <div className="eyebrow">CONSULTA ORGANIZADA</div>
                  <h2>Escolha um tópico</h2>
                  <p className="reading-intro">
                    As informações de {category.name.toLowerCase()} estão
                    separadas por categoria no índice. Use a busca para
                    localizar um termo no título ou no texto das entradas.
                  </p>
                  <div className="topic-summary">
                    {groups.map((g) => (
                      <div key={g}>
                        <strong>{g}</strong>
                        <span>
                          {sections.filter((s) => s.group === g).length}{" "}
                          entradas
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </article>
          </div>
          <SourceList system={system} />
        </>
      )}
    </div>
  );
}
function SourceList({ system }) {
  const items = sources.filter((s) => system.sources.includes(s.id));
  return (
    <details className="source-list">
      <summary>Fontes, edições e materiais pendentes ({items.length})</summary>
      <p>
        As páginas indicadas são posições no PDF, que podem diferir da numeração
        impressa. Textos são resumos e índices; os PDFs completos e os
        personagens preenchidos não são publicados.
      </p>
      {items.map((s) => (
        <div className="source-row" key={s.id}>
          <div>
            <strong>{s.title}</strong>
            <small>
              {s.type}
              {s.pages ? ` · ${s.pages} páginas` : ""}
            </small>
            <p>{s.note}</p>
          </div>
          <span
            className={
              s.status === "pendente" ? "status-pending" : "status-read"
            }
          >
            {s.status === "pendente" ? "Pendente: dividir PDF" : "Consultado"}
          </span>
        </div>
      ))}
    </details>
  );
}
function emptySheet(system) {
  return Object.fromEntries(
    system.sheet.groups.flatMap((g) =>
      g.fields.map((f) => [
        f.id,
        g.kind === "rating" || g.kind === "number" ? 0 : "",
      ]),
    ),
  );
}
function isValidSheetValues(system, values) {
  if (!values || typeof values !== "object" || Array.isArray(values))
    return false;
  return system.sheet.groups.every((g) =>
    g.fields.every((f) =>
      g.kind === "rating" || g.kind === "number"
        ? Number.isInteger(values[f.id]) &&
          values[f.id] >= 0 &&
          values[f.id] <= f.max
        : typeof values[f.id] === "string" &&
          values[f.id].length <= (g.kind === "notes" ? 20000 : 500),
    ),
  );
}
function CharacterSheet({ system }) {
  const storageKey = `arquivo-trevas-sheet-v1-${system.id}`;
  const [values, setValues] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey));
      return isValidSheetValues(system, data) ? data : emptySheet(system);
    } catch {
      return emptySheet(system);
    }
  });
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);
  const pending = useRef(false);
  useEffect(() => {
    if (!pending.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(values));
      setMessage(
        "Ficha salva neste navegador. Exporte uma cópia para guardar.",
      );
    } catch {
      setMessage(
        "Não foi possível salvar no navegador. Exporte sua ficha antes de sair.",
      );
    }
  }, [values, storageKey]);
  function change(id, value) {
    pending.current = true;
    setValues((prev) => ({ ...prev, [id]: value }));
  }
  function download() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            format: "arquivo-trevas-sheet-v1",
            systemId: system.id,
            edition: system.editionLabel,
            values,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ficha-${system.id}-${system.editionLabel}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      "Ficha exportada. O arquivo pode conter dados pessoais que você preencheu.",
    );
  }
  async function upload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2_000_000) {
      setMessage("Importe um JSON de ficha de até 2 MB.");
      return;
    }
    try {
      const data = JSON.parse(await file.text());
      if (
        data.format !== "arquivo-trevas-sheet-v1" ||
        data.systemId !== system.id ||
        data.edition !== system.editionLabel ||
        !isValidSheetValues(system, data.values)
      )
        throw Error("Formato inválido ou ficha de outro sistema/edição.");
      if (!window.confirm("Substituir a ficha deste sistema neste navegador?"))
        return;
      pending.current = true;
      setValues(
        Object.fromEntries(
          Object.keys(emptySheet(system)).map((key) => [key, data.values[key]]),
        ),
      );
    } catch (err) {
      setMessage(
        err instanceof SyntaxError
          ? "O arquivo não é um JSON válido."
          : err.message,
      );
    }
  }
  function clear() {
    if (
      !window.confirm(
        "Limpar todos os campos desta ficha? Exporte uma cópia antes se quiser guardar.",
      )
    )
      return;
    pending.current = true;
    setValues(emptySheet(system));
  }
  return (
    <details className="character-sheet" open>
      <summary>
        Ficha base preenchível — <SystemLabel system={system} />
      </summary>
      <p className="sheet-notice">
        {system.sheet.notice} O salvamento fica somente neste navegador e não é
        enviado ao GitHub ou a outros visitantes.
      </p>
      <div className="sheet-actions">
        <button className="button" onClick={download}>
          Exportar ficha JSON
        </button>
        <button className="button" onClick={() => fileRef.current.click()}>
          Importar ficha JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={upload}
          hidden
        />
        <button className="button" onClick={() => window.print()}>
          Imprimir / salvar PDF
        </button>
        <button className="text-button" onClick={clear}>
          Limpar ficha
        </button>
      </div>
      <p className="sheet-message" role="status">
        {message || "Ficha vazia. Preencha manualmente os campos desejados."}
      </p>
      <div className="sheet-grid">
        {system.sheet.groups.map((g) => (
          <fieldset
            key={g.title}
            className={`sheet-group ${g.kind === "notes" ? "sheet-group-wide" : ""}`}
          >
            <legend>{g.title}</legend>
            {g.fields.map((f) => (
              <label key={f.id}>
                <span>{f.label}</span>
                {g.kind === "notes" ? (
                  <textarea
                    rows={3}
                    maxLength={20000}
                    value={values[f.id]}
                    onChange={(e) => change(f.id, e.target.value)}
                  />
                ) : g.kind === "rating" || g.kind === "number" ? (
                  <input
                    type="number"
                    min={0}
                    max={f.max}
                    step={1}
                    value={values[f.id]}
                    onChange={(e) => {
                      const n = e.target.valueAsNumber;
                      change(
                        f.id,
                        Number.isNaN(n)
                          ? 0
                          : Math.min(f.max, Math.max(0, Math.trunc(n))),
                      );
                    }}
                  />
                ) : (
                  <input
                    value={values[f.id]}
                    maxLength={500}
                    onChange={(e) => change(f.id, e.target.value)}
                  />
                )}
              </label>
            ))}
          </fieldset>
        ))}
      </div>
    </details>
  );
}
