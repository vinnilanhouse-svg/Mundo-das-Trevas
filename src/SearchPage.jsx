import React, { useEffect, useMemo, useState } from "react";
import { catalog, useSearchIndex } from "./archive-data.js";
import { queryArchive } from "./archive-search.js";
import { parseSearchRoute, searchHref } from "./search-routes.js";
import { FavoriteControl } from "./PersonalArchive.jsx";
const PAGE_SIZE = 20;
export function SearchPage({ route }) {
  const filters = useMemo(() => parseSearchRoute(route, catalog), [route]);
  const [draft, setDraft] = useState(filters.query);
  useEffect(() => setDraft(filters.query), [filters.query]);
  const state = useSearchIndex(
    Boolean(filters.query.trim()),
    filters.systemId || null,
  );
  const all = useMemo(
    () =>
      queryArchive(state.index, filters.query, {
        systemId: filters.systemId,
        area: filters.area,
        edition: filters.edition,
        group: filters.group,
        limit: state.index.length,
      }),
    [
      state.index,
      filters.query,
      filters.systemId,
      filters.area,
      filters.edition,
      filters.group,
    ],
  );
  const pageCount = Math.max(1, Math.ceil(all.total / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const results = all.items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const groups = [
    ...new Set(
      state.index
        .filter(
          (entry) =>
            (!filters.area || entry.area === filters.area) &&
            (!filters.edition || entry.editionLabel === filters.edition),
        )
        .map((entry) => entry.group)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const change = (values) => {
    location.hash = searchHref(filters.query, {
      ...filters,
      page: 1,
      ...values,
    });
  };
  return (
    <section className="search-page" aria-labelledby="search-page-title">
      <div className="eyebrow">ENCONTRE SUA PRÓXIMA REFERÊNCIA</div>
      <h1 id="search-page-title">Buscar no acervo</h1>
      <p className="personal-description">
        Pesquise regras, histórias, poderes e índices. Refine por sistema, área
        e edição.
      </p>
      <form
        className="full-search-form"
        onSubmit={(event) => {
          event.preventDefault();
          location.hash = searchHref(draft, { ...filters, page: 1 });
        }}
      >
        <label htmlFor="full-search-query">Palavra-chave</label>
        <div>
          <input
            type="search"
            id="full-search-query"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={200}
            placeholder="Ex.: artes, vida, força de vontade…"
          />
          <button className="button" type="submit">
            Pesquisar
          </button>
        </div>
      </form>
      <div className="search-page-filters">
        <label>
          Sistema
          <select
            aria-label="Sistema"
            value={filters.systemId}
            onChange={(event) =>
              change({ systemId: event.target.value, group: "" })
            }
          >
            <option value="">Todos os sistemas</option>
            {catalog.map((system) => (
              <option key={system.id} value={system.id}>
                {system.name} {system.editionLabel}
              </option>
            ))}
          </select>
        </label>
        <label>
          Área
          <select
            aria-label="Área"
            value={filters.area}
            onChange={(event) =>
              change({ area: event.target.value, group: "" })
            }
          >
            <option value="">Todas as áreas</option>
            <option value="lore">Lore</option>
            <option value="mechanics">Mecânica</option>
            <option value="sheet">Ficha</option>
            <option value="system">Sistemas</option>
          </select>
        </label>
        <label>
          Edição
          <select
            aria-label="Edição"
            value={filters.edition}
            onChange={(event) =>
              change({ edition: event.target.value, group: "" })
            }
          >
            <option value="">Todas as edições</option>
            {[...new Set(catalog.map((system) => system.editionLabel))].map(
              (edition) => (
                <option key={edition} value={edition}>
                  {edition}
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          Categoria
          <select
            aria-label="Categoria"
            value={filters.group}
            onChange={(event) => change({ group: event.target.value })}
          >
            <option value="">Todas as categorias</option>
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!filters.query.trim() ? (
        <p className="personal-empty">
          Digite uma palavra-chave para pesquisar.
        </p>
      ) : state.loading ? (
        <p className="archive-loading" role="status">
          Buscando no acervo…
        </p>
      ) : state.error ? (
        <div className="notice" role="alert">
          <p>{state.error}</p>
          <button className="button" onClick={state.retry}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <p className="search-total" role="status">
            {all.total} {all.total === 1 ? "resultado" : "resultados"} para “
            {filters.query}”
            {all.total > 0
              ? ` · mostrando ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, all.total)}`
              : ""}
          </p>
          {results.length ? (
            <ol className="full-search-results">
              {results.map((result) => (
                <li key={result.id}>
                  <div>
                    <span
                      className="entry-context"
                      data-system={result.systemId}
                    >
                      {result.systemName} ·{" "}
                      {result.kind === "group" ? "Índice · " : ""}
                      {result.category}
                      {result.group && result.group !== result.title
                        ? ` · ${result.group}`
                        : ""}
                    </span>
                    <h2>
                      <a href={result.href}>
                        {result.title} <span aria-hidden="true">→</span>
                      </a>
                    </h2>
                    <p>{result.excerpt}</p>
                  </div>
                  <FavoriteControl entry={result} compact />
                </li>
              ))}
            </ol>
          ) : (
            <p className="personal-empty">
              Nenhuma correspondência com esses filtros. Tente outra palavra ou
              escolha todas as áreas e sistemas.
            </p>
          )}
          {pageCount > 1 && (
            <nav
              className="search-pagination"
              aria-label="Páginas dos resultados"
            >
              {page > 1 ? (
                <a
                  className="button"
                  href={searchHref(filters.query, {
                    ...filters,
                    page: page - 1,
                  })}
                >
                  ← Anterior
                </a>
              ) : (
                <span />
              )}
              <span>
                Página {page} de {pageCount}
              </span>
              {page < pageCount ? (
                <a
                  className="button"
                  href={searchHref(filters.query, {
                    ...filters,
                    page: page + 1,
                  })}
                >
                  Próxima →
                </a>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </section>
  );
}
