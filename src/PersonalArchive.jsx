import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { catalog } from "./archive-data.js";
import {
  FAVORITES_KEY,
  LIBRARY_KEY,
  RECENT_KEY,
  emptyLibrary,
  normalizeLibrary,
  normalizeRecent,
  readLibrary,
  safeReference,
  updateLibrary,
  visitRecent,
} from "./personal-archive.js";

const PersonalContext = createContext(null);
function initialState() {
  let library = emptyLibrary(),
    recent = [],
    error = false;
  try {
    library = readLibrary(localStorage, catalog);
  } catch {
    error = true;
  }
  try {
    recent = normalizeRecent(
      JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"),
      catalog,
    );
  } catch {
    error = true;
  }
  return { library, recent, error };
}
export function PersonalArchiveProvider({ children }) {
  const [initial] = useState(initialState);
  const [library, setLibrary] = useState(initial.library);
  const [recent, setRecent] = useState(initial.recent);
  const [storageError, setStorageError] = useState(initial.error);
  const current = useRef(library),
    recentRef = useRef(recent);
  const persist = useCallback((key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      setStorageError(true);
    }
  }, []);
  const commit = useCallback(
    (action) => {
      const next = updateLibrary(current.current, action);
      current.current = next;
      setLibrary(next);
      persist(LIBRARY_KEY, next);
      persist(
        FAVORITES_KEY,
        next.items
          .filter((item) => item.kind === "system")
          .map((item) => item.systemId),
      );
    },
    [persist],
  );
  useEffect(() => {
    const sync = (event) => {
      if (event.key === LIBRARY_KEY || event.key === null) {
        try {
          const next = readLibrary(localStorage, catalog);
          current.current = next;
          setLibrary(next);
        } catch {
          setStorageError(true);
        }
      }
      if (event.key === RECENT_KEY || event.key === null) {
        try {
          const next = normalizeRecent(
            JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"),
            catalog,
          );
          recentRef.current = next;
          setRecent(next);
        } catch {
          setStorageError(true);
        }
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const toggle = useCallback(
    (entry) => {
      const reference = safeReference(entry, catalog);
      if (reference) commit({ type: "toggle", entry: reference });
    },
    [commit],
  );
  const recordVisit = useCallback(
    (entry) => {
      const reference = safeReference(entry, catalog);
      if (!reference || recentRef.current[0]?.href === reference.href) return;
      const next = visitRecent(recentRef.current, reference);
      recentRef.current = next;
      setRecent(next);
      persist(RECENT_KEY, next);
    },
    [persist],
  );
  const clearRecent = useCallback(() => {
    recentRef.current = [];
    setRecent([]);
    persist(RECENT_KEY, []);
  }, [persist]);
  function collectionName(name, except) {
    const trimmed = String(name).trim().slice(0, 60);
    return trimmed &&
      !current.current.collections.some(
        (collection) =>
          collection.id !== except &&
          collection.name.toLocaleLowerCase("pt-BR") ===
            trimmed.toLocaleLowerCase("pt-BR"),
      )
      ? trimmed
      : null;
  }
  function createCollection(name) {
    const valid = collectionName(name);
    if (!valid || current.current.collections.length >= 50) return null;
    const id =
      globalThis.crypto?.randomUUID?.() ||
      `collection-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    commit({ type: "create", id, name: valid });
    return id;
  }
  function renameCollection(id, name) {
    const valid = collectionName(name, id);
    if (!valid) return false;
    commit({ type: "rename", id, name: valid });
    return true;
  }
  return (
    <PersonalContext.Provider
      value={{
        library,
        recent,
        storageError,
        toggle,
        recordVisit,
        clearRecent,
        createCollection,
        renameCollection,
        deleteCollection: (id) => commit({ type: "delete", id }),
        membership: (href, id, checked) =>
          commit({ type: "membership", href, id, checked }),
      }}
    >
      {children}
    </PersonalContext.Provider>
  );
}
export const usePersonalArchive = () => useContext(PersonalContext);
export function FavoriteControl({ entry, compact = false }) {
  const { library, toggle, membership } = usePersonalArchive();
  const saved = library.items.find((item) => item.href === entry.href);
  return (
    <div
      className={`favorite-control ${compact ? "favorite-control-compact" : ""}`}
    >
      <button
        className="text-button"
        type="button"
        aria-pressed={Boolean(saved)}
        aria-label={`${saved ? "Remover" : "Salvar"} ${entry.title} ${saved ? "dos" : "nos"} favoritos`}
        onClick={() => toggle(entry)}
      >
        {saved ? "★ Salvo" : "☆ Salvar"}
      </button>
      {saved && (
        <details className="collection-picker">
          <summary>
            Coleções
            {saved.collectionIds.length
              ? ` (${saved.collectionIds.length})`
              : ""}
          </summary>
          <div>
            {library.collections.length ? (
              library.collections.map((collection) => (
                <label key={collection.id}>
                  <input
                    type="checkbox"
                    checked={saved.collectionIds.includes(collection.id)}
                    onChange={(event) =>
                      membership(
                        entry.href,
                        collection.id,
                        event.target.checked,
                      )
                    }
                  />
                  {collection.name}
                </label>
              ))
            ) : (
              <p>Crie uma coleção para organizar seus favoritos.</p>
            )}
            <a href="#/favoritos">Abrir favoritos e coleções →</a>
          </div>
        </details>
      )}
    </div>
  );
}
function PersonalEntryList({ entries, showDate = false }) {
  return (
    <ul className="personal-entry-list">
      {entries.map((entry) => (
        <li key={entry.href}>
          <div>
            <span className="entry-context">
              {entry.systemName} · {entry.category}
              {entry.group ? ` · ${entry.group}` : ""}
            </span>
            <a className="personal-entry-link" href={entry.href}>
              {entry.title} <span aria-hidden="true">→</span>
            </a>
            {showDate && (
              <time dateTime={new Date(entry.viewedAt).toISOString()}>
                {new Date(entry.viewedAt).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            )}
          </div>
          <FavoriteControl entry={entry} compact />
        </li>
      ))}
    </ul>
  );
}
export function RecentSection({ full = false }) {
  const { recent, clearRecent } = usePersonalArchive();
  return (
    <section
      className={`recent-section ${full ? "personal-page" : ""}`}
      aria-labelledby={full ? "recent-title" : "home-recent-title"}
    >
      <div className="personal-heading">
        <div>
          <div className="eyebrow">RETOME SUA PESQUISA</div>
          {full ? (
            <h1 id="recent-title">Vistos recentemente</h1>
          ) : (
            <h2 id="home-recent-title">Vistos recentemente</h2>
          )}
        </div>
        {full ? (
          recent.length > 0 && (
            <button className="text-button" onClick={clearRecent}>
              Limpar histórico
            </button>
          )
        ) : (
          <a className="text-button" href="#/recentes">
            Ver histórico →
          </a>
        )}
      </div>
      {full && (
        <p className="personal-description">
          Suas últimas 40 consultas ficam apenas neste navegador. Você pode
          limpar a lista quando quiser.
        </p>
      )}
      {recent.length ? (
        <PersonalEntryList
          entries={full ? recent : recent.slice(0, 6)}
          showDate={full}
        />
      ) : (
        <p className="personal-empty">
          Os sistemas e tópicos que você abrir aparecerão aqui para facilitar a
          próxima consulta.
        </p>
      )}
    </section>
  );
}
export function FavoritesPage() {
  const { library, createCollection, renameCollection, deleteCollection } =
    usePersonalArchive();
  const [active, setActive] = useState("all");
  const [name, setName] = useState("");
  const [rename, setRename] = useState("");
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const selected = library.collections.find((item) => item.id === active);
  useEffect(() => {
    if (!selected && active !== "all" && active !== "none") setActive("all");
  }, [selected, active]);
  useEffect(() => {
    setRename(selected?.name || "");
    setConfirmDelete(false);
    setMessage("");
  }, [selected?.id, selected?.name]);
  const entries = library.items.filter(
    (item) =>
      active === "all" ||
      (active === "none"
        ? !item.collectionIds.length
        : item.collectionIds.includes(active)),
  );
  return (
    <section className="personal-page" aria-labelledby="favorites-title">
      <div className="eyebrow">SEU ACERVO PESSOAL</div>
      <h1 id="favorites-title">Favoritos e coleções</h1>
      <p className="personal-description">
        Guarde sistemas, tópicos, poderes e páginas de documentos. Organize por
        personagem ou crônica; tudo fica neste navegador.
      </p>
      <div className="favorites-layout">
        <aside
          className="personal-collections"
          aria-label="Coleções de favoritos"
        >
          <h2>Suas coleções</h2>
          <nav aria-label="Filtrar favoritos por coleção">
            <button
              aria-pressed={active === "all"}
              onClick={() => setActive("all")}
            >
              Todos os favoritos <span>{library.items.length}</span>
            </button>
            <button
              aria-pressed={active === "none"}
              onClick={() => setActive("none")}
            >
              Sem coleção{" "}
              <span>
                {
                  library.items.filter((item) => !item.collectionIds.length)
                    .length
                }
              </span>
            </button>
            {library.collections.map((collection) => (
              <button
                key={collection.id}
                aria-pressed={active === collection.id}
                onClick={() => setActive(collection.id)}
              >
                {collection.name}
                <span>
                  {
                    library.items.filter((item) =>
                      item.collectionIds.includes(collection.id),
                    ).length
                  }
                </span>
              </button>
            ))}
          </nav>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const id = createCollection(name);
              if (id) {
                setName("");
                setActive(id);
              } else
                setMessage(
                  "Use um nome diferente, com até 60 caracteres. Você pode ter até 50 coleções.",
                );
            }}
          >
            <label htmlFor="collection-name">Nova coleção</label>
            <input
              id="collection-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              required
              placeholder="Ex.: Crônica atual"
            />
            <button className="button" type="submit">
              Criar coleção
            </button>
          </form>
        </aside>
        <div className="personal-items">
          <div className="personal-heading">
            <h2>
              {selected?.name ||
                (active === "none" ? "Sem coleção" : "Todos os favoritos")}
            </h2>
            <span>
              {entries.length} {entries.length === 1 ? "item" : "itens"}
            </span>
          </div>
          {selected && (
            <details className="collection-settings">
              <summary>Opções desta coleção</summary>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setMessage(
                    renameCollection(selected.id, rename)
                      ? "Nome atualizado."
                      : "Use um nome diferente para esta coleção.",
                  );
                }}
              >
                <label htmlFor="rename-collection">Nome da coleção</label>
                <input
                  id="rename-collection"
                  value={rename}
                  onChange={(event) => setRename(event.target.value)}
                  maxLength={60}
                  required
                />
                <button className="button" type="submit">
                  Salvar nome
                </button>
              </form>
              {confirmDelete ? (
                <div>
                  <p>
                    Excluir esta coleção? Seus favoritos continuarão salvos.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => {
                      deleteCollection(selected.id);
                      setActive("all");
                    }}
                  >
                    Confirmar exclusão
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  className="text-button"
                  onClick={() => setConfirmDelete(true)}
                >
                  Excluir coleção
                </button>
              )}
            </details>
          )}
          <p className="personal-status" role="status">
            {message}
          </p>
          {entries.length ? (
            <PersonalEntryList entries={entries} />
          ) : (
            <div className="personal-empty">
              <p>
                {active === "all"
                  ? "Use a estrela nos sistemas ou “Salvar” nos tópicos para começar."
                  : "Abra “Coleções” em um favorito salvo e marque esta coleção para adicionar o item."}
              </p>
              <a className="button" href="#">
                Explorar o acervo
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
