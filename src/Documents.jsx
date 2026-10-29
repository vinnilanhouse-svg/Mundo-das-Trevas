import React, { useEffect, useMemo, useState } from "react";
import {
  documents,
  loadDocument,
  citedPages,
  searchPages,
  bookPageLabel,
} from "./document-data.js";
import translatedCitations from "./translated-citations.json";

function useDocument(sourceId, enabled = true) {
  const [state, setState] = useState({ sourceId: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled || !sourceId) return;
    let active = true;
    setState({ sourceId, loading: true });
    loadDocument(sourceId).then(
      (data) => active && setState({ sourceId, data }),
      (error) => active && setState({ sourceId, error: error.message }),
    );
    return () => {
      active = false;
    };
  }, [sourceId, enabled, attempt]);
  return {
    ...(state.sourceId === sourceId ? state : { loading: true }),
    retry: () => setAttempt((value) => value + 1),
  };
}

function LoadingState({ state }) {
  return state.error ? (
    <div role="alert">
      <p>{state.error}</p>
      <button className="button" onClick={state.retry}>
        Tentar carregar novamente
      </button>
    </div>
  ) : (
    <p role="status">Carregando texto do documento…</p>
  );
}

function PageText({ document, page }) {
  return (
    <section
      className="document-page"
      aria-label={`Texto da página ${page.number}`}
    >
      <div className="document-page-heading">
        <h3>
          Página {page.number} de {document.pages}
          {bookPageLabel(document, page.number) &&
            ` · ${bookPageLabel(document, page.number)}`}
        </h3>
        <a
          href={`${document.pdfUrl}#page=${page.number}`}
          target="_blank"
          rel="noreferrer"
        >
          Ver página original ↗
        </a>
      </div>
      <p className="document-method">
        {page.method === "ocr"
          ? "Transcrição por OCR: pode conter erros de leitura. Confira tabelas, números e símbolos na página original."
          : "Texto extraído do PDF, sem resumo. A diagramação e alguns símbolos podem diferir da página original."}
      </p>
      {page.text.trim() ? (
        <pre className="document-text" lang={document.language}>
          {page.text}
        </pre>
      ) : (
        <p>
          Esta página não tem texto recuperável. Abra a página original para
          consultar seu conteúdo visual.
        </p>
      )}
    </section>
  );
}

export function DocumentLinks({ system }) {
  const available = documents.filter((item) => item.system === system.id);
  return (
    <section
      className="document-catalog"
      aria-label="Textos integrais dos PDFs"
    >
      <h2>Textos integrais dos PDFs</h2>
      <p>
        Leia por página ou busque no documento inteiro. As páginas originais
        também estão disponíveis.
      </p>
      {available.length ? (
        available.map((document) => (
          <a
            className="document-link"
            key={document.sourceId}
            href={`#/sistema/${system.id}/documentos/${document.sourceId}/1`}
          >
            <strong>{document.title}</strong>
            <span>
              {document.pages} páginas ·{" "}
              {document.language === "en" ? "Inglês" : "Português"}
              {document.method === "ocr" ? " · OCR" : ""} →
            </span>
          </a>
        ))
      ) : (
        <p>
          O livro completo deste sistema ainda está pendente. As fichas
          preenchidas não são publicadas.
        </p>
      )}
    </section>
  );
}

export function DocumentReader({ system, route }) {
  const available = documents.filter((item) => item.system === system.id);
  const sourceId = route.split("/")[4];
  const document = available.find((item) => item.sourceId === sourceId);
  if (!sourceId) return <DocumentLinks system={system} />;
  if (!document)
    return (
      <div className="empty-state">
        <h2>Documento não encontrado</h2>
        <p>Este arquivo não faz parte das fontes disponíveis deste sistema.</p>
        <a className="button" href={`#/sistema/${system.id}/documentos`}>
          Ver documentos disponíveis
        </a>
      </div>
    );
  return (
    <Reader
      key={sourceId}
      system={system}
      document={document}
      route={route}
      available={available}
    />
  );
}

function Reader({ system, document, route, available }) {
  const state = useDocument(document.sourceId);
  const routeNumber = Number(route.split("/")[5] || 1);
  const number =
    Number.isInteger(routeNumber) &&
    routeNumber >= 1 &&
    routeNumber <= document.pages
      ? routeNumber
      : null;
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(40);
  const base = `#/sistema/${system.id}/documentos/${document.sourceId}`;
  const results = useMemo(
    () => searchPages(state.data?.pages || [], query),
    [state.data, query],
  );
  useEffect(() => {
    setShown(40);
  }, [query]);
  useEffect(() => {
    window.document
      .querySelector(".document-reader")
      ?.scrollIntoView({ block: "start" });
  }, [number]);
  return (
    <div className="document-reader">
      <a href={`#/sistema/${system.id}/documentos`}>
        ← Todos os documentos deste sistema
      </a>
      <h2>{document.title}</h2>
      <p>
        {document.pages} páginas ·{" "}
        {document.language === "en"
          ? "Texto original em inglês"
          : "Texto em português"}
        . A numeração indica a posição no PDF.
        {Number.isInteger(document.printedStart) &&
          " A referência ao livro acompanha a numeração da parte recebida; capas e folhas de abertura podem não ter número impresso."}
      </p>
      <div className="document-controls">
        <label>
          Documento
          <select
            aria-label="Escolher documento"
            value={document.sourceId}
            onChange={(event) => {
              location.hash = `#/sistema/${system.id}/documentos/${event.target.value}/1`;
            }}
          >
            {available.map((item) => (
              <option key={item.sourceId} value={item.sourceId}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Página
          <select
            aria-label="Ir para página do PDF"
            value={number || ""}
            onChange={(event) => {
              location.hash = `${base}/${event.target.value}`;
            }}
          >
            {!number && <option value="">Página inválida</option>}
            {Array.from({ length: document.pages }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
                {bookPageLabel(document, index + 1) &&
                  ` · ${bookPageLabel(document, index + 1)}`}
              </option>
            ))}
          </select>
        </label>
      </div>
      <details className="document-outline">
        <summary>Sumário e navegação por páginas</summary>
        {document.outline.length ? (
          <nav aria-label="Sumário do documento">
            {document.outline.map((item, index) => (
              <a
                key={index}
                href={`${base}/${item.page}`}
                className={item.level > 1 ? "outline-nested" : ""}
              >
                {item.title} <small>p. {item.page}</small>
              </a>
            ))}
          </nav>
        ) : (
          <p>
            Este PDF não possui sumário digital. Use a seleção de página ou a
            busca no texto completo.
          </p>
        )}
      </details>
      <label className="document-search">
        Buscar em todo o documento
        <input
          type="search"
          aria-label="Buscar em todo o documento"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ex.: antecedentes, Acesso Global…"
        />
      </label>
      {!state.data ? (
        <LoadingState state={state} />
      ) : (
        <>
          {query.trim() && (
            <section
              className="document-results"
              aria-label="Resultados no documento"
            >
              <p role="status">{results.length} páginas encontradas</p>
              {results.slice(0, shown).map((result) => (
                <a key={result.number} href={`${base}/${result.number}`}>
                  <strong>
                    Página {result.number}
                    {bookPageLabel(document, result.number) &&
                      ` · ${bookPageLabel(document, result.number)}`}
                  </strong>
                  <span>{result.excerpt}</span>
                </a>
              ))}
              {results.length > shown && (
                <button
                  className="button"
                  onClick={() => setShown((value) => value + 40)}
                >
                  Mostrar mais resultados
                </button>
              )}
            </section>
          )}
          {number ? (
            <>
              <PageNavigation
                base={base}
                number={number}
                total={document.pages}
              />
              <PageText
                document={document}
                page={state.data.pages[number - 1]}
              />
              <PageNavigation
                base={base}
                number={number}
                total={document.pages}
              />
            </>
          ) : (
            <p role="alert">
              Página inválida. Escolha um número entre 1 e {document.pages}.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function PageNavigation({ base, number, total }) {
  return (
    <nav
      className="document-pagination"
      aria-label="Navegar pelas páginas do PDF"
    >
      {number > 1 ? (
        <a className="button" href={`${base}/${number - 1}`}>
          ← Anterior
        </a>
      ) : (
        <span />
      )}
      <span>
        {number} / {total}
      </span>
      {number < total ? (
        <a className="button" href={`${base}/${number + 1}`}>
          Próxima →
        </a>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function SourceText({ article, system }) {
  const document = documents.find(
    (item) => item.sourceId === article.sourceId && item.system === system.id,
  );
  if (!document) return null;
  if (document.language === "en") {
    const citation = translatedCitations.find(
      (item) => item.id === article.id && item.sourceId === document.sourceId,
    );
    return (
      <TranslatedSourceText
        key={`${article.sourceId}-${article.id}`}
        citation={citation}
        document={document}
        system={system}
      />
    );
  }
  return (
    <CitedText
      key={`${article.sourceId}-${article.id}`}
      article={article}
      document={document}
      system={system}
    />
  );
}

function TranslatedSourceText({ citation, document, system }) {
  return (
    <details className="source-transcription translated-citation">
      <summary>Ler citação em português</summary>
      {citation ? (
        <>
          <p>
            Tradução do trecho citado. A referência abaixo identifica a página
            do PDF original; esta não é uma tradução oficial.
          </p>
          <blockquote lang="pt-BR">{citation.translation}</blockquote>
          <p className="citation-attribution">
            Changeling: O Sonhar — Edição de 20º Aniversário · PDF p.{" "}
            {citation.page}
          </p>
          <details className="citation-original">
            <summary>Comparar com o trecho original em inglês</summary>
            <blockquote lang="en">{citation.original}</blockquote>
          </details>
          <a
            className="button"
            href={`#/sistema/${system.id}/documentos/${document.sourceId}/${citation.page}`}
          >
            Consultar página no documento original →
          </a>
        </>
      ) : (
        <p>
          Este trecho ainda não tem tradução. O documento original continua
          disponível no leitor integral.
        </p>
      )}
    </details>
  );
}

function CitedText({ article, document, system }) {
  const [open, setOpen] = useState(false);
  const state = useDocument(document.sourceId, open);
  const pages = citedPages(article.pages, document.pages);
  const [selected, setSelected] = useState(pages[0] || 1);
  return (
    <details
      className="source-transcription"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>Ler texto literal da fonte</summary>
      <p>
        Páginas citadas no tópico. O texto abaixo pertence ao documento; a
        explicação acima está organizada por assunto.
      </p>
      <label>
        Página citada
        <select
          aria-label="Escolher página citada"
          value={selected}
          onChange={(event) => setSelected(Number(event.target.value))}
        >
          {(pages.length ? pages : [1]).map((number) => (
            <option key={number} value={number}>
              {number}
              {bookPageLabel(document, number) &&
                ` · ${bookPageLabel(document, number)}`}
            </option>
          ))}
        </select>
      </label>
      {state.data ? (
        <PageText document={document} page={state.data.pages[selected - 1]} />
      ) : (
        open && <LoadingState state={state} />
      )}
      <a
        className="button"
        href={`#/sistema/${system.id}/documentos/${document.sourceId}/${selected}`}
      >
        Abrir documento completo e buscar →
      </a>
    </details>
  );
}
