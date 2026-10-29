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

export function SystemLibrary({ system, route, favorite, onFavorite }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [powerLevel, setPowerLevel] = useState("all");
  const [powerBranch, setPowerBranch] = useState("all");
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
      (powerLevel === "all" ||
        (s.power && String(s.power.level) === powerLevel)) &&
      (powerBranch === "all" || s.power?.branch === powerBranch) &&
      normalize(
        `${s.title} ${s.body} ${s.group} ${s.edition} ${s.power?.rules || ""}`,
      ).includes(normalize(query)),
  );
  const arcanoiDirectory =
    system.id === "aparicao"
      ? system.sections.find((s) => s.id === "mechanics-arcanoi-arcanoi")
      : null;
  const article =
    sections.find((s) => s.id === sectionSlug) ||
    (!sectionSlug && category?.key === "mechanics" ? arcanoiDirectory : null);
  useEffect(() => {
    setQuery("");
    setGroup("all");
    setPowerLevel("all");
    setPowerBranch("all");
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
          {category.key === "mechanics" && arcanoiDirectory && (
            <a
              className="button arcanoi-home-link"
              href={`${base}/mecanica/${arcanoiDirectory.id}`}
            >
              Consultar os 16 Arcanoi →
            </a>
          )}
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
          {sections.some((s) => s.power) && (
            <div className="power-filters">
              <label>
                Nível
                <select
                  aria-label="Filtrar poderes por nível"
                  value={powerLevel}
                  onChange={(e) => setPowerLevel(e.target.value)}
                >
                  <option value="all">Todos os níveis e tópicos</option>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <option key={level} value={String(level)}>
                      Nível {level}
                    </option>
                  ))}
                  <option value="null">Sem nível numérico</option>
                </select>
              </label>
              <label>
                Tipo de poder
                <select
                  aria-label="Filtrar por tipo de poder"
                  value={powerBranch}
                  onChange={(e) => setPowerBranch(e.target.value)}
                >
                  <option value="all">Todos os tipos</option>
                  {[
                    ...new Set(
                      sections
                        .filter((s) => s.power)
                        .map((s) => s.power.branch),
                    ),
                  ].map((branch) => (
                    <option key={branch}>{branch}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
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
                  {arcanoiDirectory && article.id === arcanoiDirectory.id && (
                    <ArcanoiDirectory system={system} base={base} />
                  )}
                  {article.power && <PowerDetails power={article.power} />}
                  <PowerProgression
                    system={system}
                    article={article}
                    base={base}
                  />
                  <div className="source">
                    <span>
                      <strong>Fonte:</strong> {article.source}
                      <br />
                      <small>
                        {sources.find((s) => s.id === article.sourceId)?.note}
                      </small>
                    </span>
                  </div>
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
function ArcanoiDirectory({ system, base }) {
  const families = system.sections.filter(
    (s) => s.group === "Arcanoi — fundamentos" && s.powerFamily,
  );
  return (
    <section
      className="arcanoi-directory"
      aria-label="Diretório dos 16 Arcanoi"
    >
      <h3>Escolha um Arcanos</h3>
      <p>
        Abra um Arcanos para comparar seus cinco níveis. Em cada nível você
        encontra a arte Comum, a arte Iniciada e o efeito de cada uma. A entrada
        individual traz o sistema, as condições e a fonte.
      </p>
      <div className="arcanoi-grid">
        {families.map((family) => {
          const powers = system.sections.filter(
            (s) => s.power && s.power.family === family.powerFamily,
          );
          return (
            <article className="arcanoi-card" key={family.id}>
              <h4>
                <a href={`${base}/mecanica/${family.id}`}>{family.title} →</a>
              </h4>
              <p>{family.body.split("\n\n")[0]}</p>
              <span>
                {powers.filter((p) => p.power.branch === "Comum").length} artes
                Comuns ·{" "}
                {powers.filter((p) => p.power.branch === "Iniciada").length}{" "}
                Iniciadas
              </span>
              <ol aria-label={`Níveis de ${family.title}`}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <li key={level}>
                    <strong>Nível {level}</strong>
                    {powers
                      .filter((p) => p.power.level === level)
                      .map((power) => (
                        <a href={`${base}/mecanica/${power.id}`} key={power.id}>
                          <small>{power.power.branch}</small>
                          {power.title
                            .replace(/^[1-5] · /, "")
                            .replace(" (Iniciada)", "")}
                        </a>
                      ))}
                  </li>
                ))}
              </ol>
              <a className="text-button" href={`${base}/mecanica/${family.id}`}>
                Ver explicação dos cinco níveis →
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PowerDetails({ power }) {
  const rows = [
    ["Nível", power.level ?? "Sem escala numérica"],
    ["Tipo", power.branch],
    ["Custo", power.cost],
    ["Teste / parada", power.roll],
    ["Duração", power.duration],
    ["Requisitos / amálgama", power.requirements],
  ].filter(([, value]) => value !== "");
  return (
    <section className="power-details" aria-label="Como usar este poder">
      <h3>Como funciona</h3>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {power.rules && (
        <details className="power-rules" open>
          <summary>Sistema e condições da fonte</summary>
          <div className="article-body">{power.rules}</div>
        </details>
      )}
      {power.referenceNote && (
        <p className="power-note">{power.referenceNote}</p>
      )}
      <p className="power-citation">Referência do efeito: {power.source}</p>
    </section>
  );
}
function PowerProgression({ system, article, base }) {
  const family = article.power?.family || article.powerFamily;
  if (!family) return null;
  const related = system.sections.filter(
    (s) => s.power && normalize(s.power.family) === normalize(family),
  );
  if (!related.length) return null;
  const levels = [...new Set(related.map((s) => s.power.level))].sort(
    (a, b) => (a ?? 99) - (b ?? 99),
  );
  return (
    <section
      className="power-progression"
      aria-label={`Efeitos por nível de ${family}`}
    >
      <h3>
        {levels.every((level) => level === null)
          ? "Opções e distinções"
          : "O que cada nível faz"}{" "}
        — {family}
      </h3>
      {system.id === "vampiro" && (
        <p>
          Em V5, o nível libera opções de poderes. A personagem escolhe o que
          aprende; não recebe automaticamente todos os poderes listados no
          nível.
        </p>
      )}
      {system.id === "aparicao" && (
        <p>
          Cada nível tem uma arte Comum e uma arte Iniciada, com efeitos
          diferentes. O acesso às artes Iniciadas depende do aprendizado e da
          tradição; elas não são recebidas automaticamente com a arte Comum.
        </p>
      )}
      {levels.map((level) => (
        <details
          key={level ?? "none"}
          open={related.length <= 10 || article.power?.level === level}
        >
          <summary>
            {level === null ? "Opções sem nível numérico" : `Nível ${level}`} ·{" "}
            {related.filter((s) => s.power.level === level).length} opções
          </summary>
          <div>
            {related
              .filter((s) => s.power.level === level)
              .map((s) => (
                <div className="power-choice" key={s.id}>
                  <a href={`${base}/mecanica/${s.id}`}>{s.title}</a>
                  <span className="power-branch">
                    {system.id === "aparicao"
                      ? `Arte ${s.power.branch}`
                      : s.power.branch}{" "}
                    · {s.edition}
                  </span>
                  <p>{s.power.effect}</p>
                </div>
              ))}
          </div>
        </details>
      ))}
    </section>
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
      if (!data || typeof data !== "object" || Array.isArray(data))
        return emptySheet(system);
      // Newly documented fields start empty; existing values and legacy keys stay recoverable.
      const merged = { ...emptySheet(system), ...data };
      return isValidSheetValues(system, merged) ? merged : emptySheet(system);
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
        !data.values ||
        typeof data.values !== "object" ||
        Array.isArray(data.values) ||
        !isValidSheetValues(system, { ...emptySheet(system), ...data.values })
      )
        throw Error("Formato inválido ou ficha de outro sistema/edição.");
      if (!window.confirm("Substituir a ficha deste sistema neste navegador?"))
        return;
      pending.current = true;
      setValues({ ...emptySheet(system), ...data.values });
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
