import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createArchiveIndex, searchArchive } from "./archive-search.js";

export function ArchiveSearch({ systems, systemId, route }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const input = useRef(null);
  const links = useRef([]);
  const id = useId();
  const system = systems.find((item) => item.id === systemId);
  const scope = system
    ? `${system.name} ${system.editionLabel}`
    : "Todos os sistemas";
  const index = useMemo(() => createArchiveIndex(systems), [systems]);
  const results = useMemo(
    () => searchArchive(index, query, { systemId: system?.id }),
    [index, query, system?.id],
  );
  const visible = open && Boolean(query.trim());

  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [route]);
  useEffect(() => {
    const outside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const shortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("keydown", shortcut);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("keydown", shortcut);
    };
  }, []);

  function close() {
    input.current?.focus();
    setOpen(false);
  }
  function inputKey(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const position = event.key === "ArrowDown" ? 0 : results.length - 1;
      requestAnimationFrame(() => links.current[position]?.focus());
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (results[0]) {
        setOpen(false);
        location.hash = results[0].href;
      }
    }
  }
  function resultKey(event, position) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      links.current[(position + 1) % results.length]?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (position === 0) input.current?.focus();
      else links.current[position - 1]?.focus();
    }
  }

  return (
    <div
      className="portal-search archive-search"
      ref={root}
      role="search"
      aria-label="Pesquisa de conteúdo"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="10.5" cy="10.5" r="7.5" />
        <path d="m16 16 5 5" />
      </svg>
      <input
        ref={input}
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={inputKey}
        autoComplete="off"
        spellCheck={false}
        maxLength={200}
        placeholder={system ? `Buscar em ${system.name}…` : "Buscar no acervo…"}
        aria-label={system ? `Buscar em ${scope}` : "Buscar no acervo"}
        aria-describedby={`${id}-scope`}
        aria-controls={visible ? `${id}-results` : undefined}
      />
      <span className="archive-search-sr" id={`${id}-scope`}>
        Pesquisa em {scope}. Até cinco resultados. Use as setas para navegar,
        Enter para abrir e Escape para fechar.
      </span>
      {query ? (
        <button
          className="archive-search-clear"
          aria-label="Limpar busca"
          onClick={() => {
            setQuery("");
            input.current?.focus();
          }}
        >
          ×
        </button>
      ) : (
        <kbd>Ctrl K</kbd>
      )}
      {visible && (
        <div className="archive-search-panel" id={`${id}-results`}>
          <div className="archive-search-heading">
            <span>Resultados mais relevantes</span>
            <strong>{scope}</strong>
          </div>
          <p className="archive-search-count" role="status">
            {results.length
              ? `${results.length} ${results.length === 1 ? "resultado" : "resultados"}`
              : `Nenhum resultado para “${query}”.`}
          </p>
          {results.length ? (
            <nav aria-label="Resultados da busca">
              <ol>
                {results.map((result, position) => (
                  <li key={result.id}>
                    <a
                      className="archive-search-result"
                      href={result.href}
                      ref={(node) => {
                        links.current[position] = node;
                      }}
                      onKeyDown={(event) => resultKey(event, position)}
                      onClick={() => setOpen(false)}
                    >
                      <span className="archive-search-meta">
                        <span
                          className="archive-search-system"
                          data-system={result.systemId}
                        >
                          {result.systemName}
                        </span>
                        <span>
                          {result.kind === "group" ? "Índice · " : ""}
                          {result.category}
                          {result.group && result.group !== result.title
                            ? ` · ${result.group}`
                            : ""}
                        </span>
                      </span>
                      <strong>{result.title}</strong>
                      <span className="archive-search-excerpt">
                        {result.excerpt.slice(0, 155)}
                        {result.excerpt.length > 155 ? "…" : ""}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : (
            <p className="archive-search-empty">
              Tente outro termo
              {system
                ? " ou volte à home para pesquisar nos outros sistemas"
                : " ou uma expressão mais curta"}
              .
            </p>
          )}
          <div className="archive-search-help">
            ↑ ↓ navegar <span>Enter abrir</span>
            <button onClick={close}>
              Fechar <kbd>Esc</kbd>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
