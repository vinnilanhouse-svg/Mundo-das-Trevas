import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import initialContent from "./content.json";
import { SystemLibrary, SystemLabel } from "./Library.jsx";
import { ArchiveSearch } from "./ArchiveSearch.jsx";
import { PortalAtmosphere } from "./PortalAtmosphere.jsx";
import { WelcomeNotice, ContactPage } from "./Community.jsx";
import { BrandMark } from "./BrandMark.jsx";
import {
  PrivacyProvider,
  PrivacyNotices,
  PrivacyPage,
  usePrivacy,
} from "./Privacy.jsx";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "./styles.css";
import "./sheets.css";
import "./community.css";
import "./portals.css";
import "./sheet-themes.css";
import "./changeling-stained.css";
import "./selected-sheet-themes.css";
import "./privacy.css";
import "./brand.css";

const FAVORITES_KEY = "arquivo-trevas-favorites-v1";
const SYSTEM_THEMES = {
  aparicao: "theme-aparicao",
  changeling: "theme-changeling",
  cacador: "theme-cacador",
  vampiro: "theme-vampiro",
  mago: "theme-mago",
};
const paths = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  book: "M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1m0-15c3-2 6-2 9-1v15c-3-1-6-1-9 1V5Z",
  search: "M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z",
  close: "m6 6 12 12M6 18 18 6",
  info: "M12 11v6m0-10v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  upload: "M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5",
  menu: "M4 6h16M4 12h16M4 18h16",
  back: "M19 12H5m6-6-6 6 6 6",
  check: "m5 12 4 4L19 6",
  mail: "M3 5h18v14H3z M3 5l9 7 9-7",
  sheet: "M6 3h9l4 4v14H6z M14 3v5h5 M9 12h7m-7 4h7",
  mechanics:
    "M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
};
function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.book} />
    </svg>
  );
}
function Sigil({ kind = "vampire", className = "" }) {
  const designs = {
    vampire: (
      <>
        <path d="m16 22 16 33 16-33-8 4-8-10-8 10Z" />
        <path d="m24 26 8 18 8-18M32 16v28" />
        <circle cx="32" cy="10" r="2" />
      </>
    ),
    mage: (
      <>
        <circle cx="32" cy="32" r="23" />
        <path d="m32 8 7 17 18 7-18 7-7 17-7-17-18-7 18-7Z" />
        <circle cx="32" cy="32" r="6" />
      </>
    ),
    ghost: (
      <>
        <path d="M15 51V29a17 17 0 0 1 34 0v22l-8-5-9 7-9-7Z" />
        <path d="M25 29v7m14-7v7m-13 6q6-5 12 0" />
      </>
    ),
    fae: (
      <>
        <path d="M32 52V15m0 22C3 39 8 6 27 24l5 13c29 2 24-31 5-13Zm0 0C8 35 12 61 28 45m4-8c24-2 20 24 4 8M25 9l7 6 7-6" />
      </>
    ),
    hunter: (
      <>
        <circle cx="32" cy="32" r="19" />
        <path d="M32 5v17m0 20v17M5 32h17m20 0h17M25 32h14m-7-7v14" />
      </>
    ),
  };
  return (
    <svg
      className={`sigil ${className}`}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {designs[kind]}
    </svg>
  );
}
function load(key, fallback, validator = () => true) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return validator(data) ? data : fallback;
  } catch {
    return fallback;
  }
}
function App() {
  const systems = initialContent;
  const { choice, settingsOpen, setSettingsOpen } = usePrivacy();
  const [favorites, setFavorites] = useState(() =>
    load(
      FAVORITES_KEY,
      [],
      (x) => Array.isArray(x) && x.every((id) => typeof id === "string"),
    ),
  );
  const [route, setRoute] = useState(location.hash);
  const [edition, setEdition] = useState("Todas as edições");
  const [view, setView] = useState("all");
  const [menu, setMenu] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    const onHash = () => {
      setRoute(location.hash);
      setMenu(false);
      if (
        location.hash.startsWith("#/sistema/") &&
        location.hash.split("/")[4] &&
        location.hash.split("/")[3] !== "documentos"
      ) {
        requestAnimationFrame(() =>
          document
            .querySelector(".library-article")
            ?.scrollIntoView({ block: "start" }),
        );
      } else {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      setStorageError(true);
    }
  }, [favorites]);
  const selectedId = route.startsWith("#/sistema/")
    ? route.split("/")[2]
    : null;
  const selected = systems.find((s) => s.id === selectedId);
  const contactOpen = route === "#/contato";
  const privacyOpen = route === "#/privacidade";
  useEffect(() => {
    document.title = selected
      ? `${selected.name} ${selected.editionLabel}: ${selected.subtitle} — Arquivo das Trevas`
      : privacyOpen
        ? "Privacidade — Arquivo das Trevas"
        : contactOpen
          ? "Contato — Arquivo das Trevas"
          : "Arquivo das Trevas — Acervo de sistemas";
  }, [selected, contactOpen, privacyOpen]);
  function navigate(nextView) {
    setView(nextView);
    location.hash = "";
    setMenu(false);
  }
  function toggleFavorite(id) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  const filtered = systems.filter(
    (system) =>
      (view !== "favorites" || favorites.includes(system.id)) &&
      (edition === "Todas as edições" || system.editions.includes(edition)),
  );
  return (
    <div
      className={`app-shell portal-theme ${SYSTEM_THEMES[selectedId] || ""}`}
    >
      <WelcomeNotice paused={!choice || settingsOpen || privacyOpen} />
      <PrivacyNotices hideBanner={privacyOpen} />
      <PortalAtmosphere systemId={selected?.id} />
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const content = document.getElementById("main-content");
          content?.focus();
          content?.scrollIntoView({ block: "start" });
        }}
      >
        Pular para o conteúdo
      </a>
      <header className="portal-header">
        <a
          className="brand portal-brand"
          href="#"
          onClick={() => navigate("all")}
        >
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span>
            Arquivo<span className="brand-bottom">das Trevas</span>
          </span>
        </a>
        <nav className="portal-navigation" aria-label="Navegação principal">
          <button
            className={
              !selected && !contactOpen && !privacyOpen && view === "all"
                ? "current"
                : ""
            }
            onClick={() => navigate("all")}
          >
            Início
          </button>
          <button
            onClick={() => {
              navigate("all");
              requestAnimationFrame(() =>
                document
                  .getElementById("portais")
                  ?.scrollIntoView({ block: "start" }),
              );
            }}
          >
            Sistemas
          </button>
          <details className="portal-document-menu">
            <summary>Documentos</summary>
            <div>
              <span>ESCOLHA UM SISTEMA</span>
              {systems.map((system) => (
                <a
                  key={system.id}
                  href={`#/sistema/${system.id}/documentos`}
                  onClick={(event) =>
                    event.currentTarget
                      .closest("details")
                      .removeAttribute("open")
                  }
                >
                  <SystemLabel system={system} />
                  <Icon name="arrow" size={15} />
                </a>
              ))}
            </div>
          </details>
          <a href="#/contato" className={contactOpen ? "current" : ""}>
            Contato
          </a>
        </nav>
        <ArchiveSearch
          systems={systems}
          systemId={selected?.id}
          route={route}
        />
        <button
          className={`icon-button portal-favorites ${view === "favorites" && !selected ? "is-favorite" : ""}`}
          onClick={() => navigate("favorites")}
          aria-label="Ver favoritos"
          title="Seus favoritos"
        >
          <Icon name="star" />
        </button>
        <button
          className="mobile-menu icon-button"
          aria-label="Abrir navegação"
          aria-expanded={menu}
          onClick={() => setMenu(true)}
        >
          <Icon name="menu" />
        </button>
      </header>
      {menu && (
        <button
          className="sidebar-scrim"
          aria-label="Fechar navegação"
          onClick={() => setMenu(false)}
        />
      )}
      <aside
        className={`sidebar ${menu ? "is-open" : ""}`}
        aria-label="Menu de navegação"
      >
        <button
          className="drawer-close icon-button"
          aria-label="Fechar navegação"
          onClick={() => setMenu(false)}
        >
          <Icon name="close" />
        </button>
        <a className="brand" href="#" onClick={() => navigate("all")}>
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span>
            ARQUIVO<span className="brand-bottom">DAS TREVAS</span>
          </span>
        </a>
        <div className="sidebar-label">SEU GUIA NA ESCURIDÃO</div>
        <nav className="main-nav" aria-label="Navegação principal">
          <button
            className={
              view === "all" && !selectedId && !contactOpen ? "active" : ""
            }
            onClick={() => navigate("all")}
          >
            <Icon name="grid" /> Acervo de sistemas{" "}
            <span>{systems.length}</span>
          </button>
          <button
            className={
              view === "favorites" && !selectedId && !contactOpen
                ? "active"
                : ""
            }
            onClick={() => navigate("favorites")}
          >
            <Icon name="star" /> Favoritos{" "}
            <span>
              {
                favorites.filter((id) => systems.some((s) => s.id === id))
                  .length
              }
            </span>
          </button>
        </nav>
        <div className="sidebar-label system-label">EXPLORE OS SISTEMAS</div>
        <nav className="system-nav" aria-label="Sistemas de RPG">
          {systems.map((s) => (
            <a
              href={`#/sistema/${s.id}`}
              className={selectedId === s.id ? "selected" : ""}
              key={s.id}
            >
              <span className={`system-dot ${s.kind}`} />
              <SystemLabel system={s} />
              <Icon name="arrow" size={14} />
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="tiny-star">✧</span>
            <p>
              Todo segredo merece
              <br />
              um lugar para ser guardado.
            </p>
          </div>
          <a
            className="about-link contact-nav-link"
            href="#/contato"
            aria-current={contactOpen ? "page" : undefined}
          >
            <Icon name="mail" size={17} /> Contato
          </a>
          <button className="about-link" onClick={() => navigate("about")}>
            <Icon name="info" size={17} /> Sobre o projeto
          </button>
          <span className="version">ACERVO INDEPENDENTE · V.0.4</span>
        </div>
      </aside>
      <div className="workspace">
        <main id="main-content" tabIndex={-1}>
          {storageError && (
            <div className="notice" role="alert">
              O armazenamento do navegador está indisponível. Seus favoritos
              podem não ser mantidos ao fechar a página.
            </div>
          )}
          {selectedId && !selected ? (
            <div className="empty-state">
              <Icon name="search" size={34} />
              <h1>Sistema não encontrado</h1>
              <p>Esse endereço não corresponde a um sistema do acervo atual.</p>
              <button className="button" onClick={() => navigate("all")}>
                Voltar ao acervo
              </button>
            </div>
          ) : selected ? (
            <SystemLibrary
              key={selected.id}
              system={selected}
              route={route}
              favorite={favorites.includes(selected.id)}
              onFavorite={() => toggleFavorite(selected.id)}
            />
          ) : contactOpen ? (
            <ContactPage onBack={() => navigate("all")} />
          ) : privacyOpen ? (
            <PrivacyPage onBack={() => navigate("all")} />
          ) : view === "about" ? (
            <About />
          ) : (
            <>
              <section className="hero portal-hero">
                <div className="hero-copy">
                  <div className="eyebrow">
                    <span /> UM ACERVO PARA QUEM ATRAVESSA A NOITE
                  </div>
                  <h1>
                    Muitas histórias.
                    <br className="mobile-hero-break" /> Um Mundo das Trevas.
                  </h1>
                  <p>
                    Histórias, regras e segredos do outro lado da realidade.
                    Escolha seu caminho. Sua próxima crônica começa aqui.
                  </p>
                  <div className="hero-meta">
                    <span>
                      <Icon name="book" size={15} /> {systems.length} sistemas
                      para explorar
                    </span>
                    <span className="meta-divider" />
                    <span>
                      {systems
                        .reduce(
                          (count, system) => count + system.sections.length,
                          0,
                        )
                        .toLocaleString("pt-BR")}{" "}
                      referências para sua mesa
                    </span>
                  </div>
                </div>
              </section>
              <div className="portal-collection-toolbar" id="portais">
                <div className="collection-heading">
                  <div>
                    <div className="eyebrow muted">ESCOLHA SEU PORTAL</div>
                    <h2>
                      {view === "favorites"
                        ? "Seus arquivos favoritos"
                        : "Do outro lado"}
                      <span>
                        {" "}
                        /{" "}
                        {String(
                          view === "favorites"
                            ? systems.filter((s) => favorites.includes(s.id))
                                .length
                            : systems.length,
                        ).padStart(2, "0")}
                      </span>
                    </h2>
                  </div>
                  <span className="collection-note">
                    Escolha por onde entrar.
                  </span>
                </div>
                <section className="filters" aria-label="Filtrar sistemas">
                  <span className="filter-caption">
                    Cinco perspectivas sobre o mesmo mundo.
                  </span>
                  <label className="edition-select">
                    <Icon name="book" size={17} />
                    <select
                      value={edition}
                      onChange={(e) => setEdition(e.target.value)}
                      aria-label="Filtrar por edição"
                    >
                      {[
                        "Todas as edições",
                        ...new Set(systems.flatMap((s) => s.editions)),
                      ].map((e) => (
                        <option key={e}>{e}</option>
                      ))}
                    </select>
                  </label>
                </section>
              </div>
              <div className="results-label" aria-live="polite">
                <span>
                  {filtered.length}{" "}
                  {filtered.length === 1
                    ? "sistema encontrado"
                    : "sistemas encontrados"}
                </span>
                <span>UNIVERSO CLÁSSICO · WORLD OF DARKNESS</span>
              </div>
              {filtered.length ? (
                <section className="card-grid" aria-label="Acervo de sistemas">
                  {filtered.map((s, i) => (
                    <article
                      className={`system-card ${s.kind}`}
                      key={s.id}
                      style={{ "--card-order": i }}
                    >
                      <div className="card-top">
                        <span className="card-index">
                          ARQUIVO /{" "}
                          {String(systems.indexOf(s) + 1).padStart(2, "0")}
                        </span>
                        <button
                          className={`favorite-button icon-button ${favorites.includes(s.id) ? "is-favorite" : ""}`}
                          onClick={() => toggleFavorite(s.id)}
                          aria-pressed={favorites.includes(s.id)}
                          aria-label={`${favorites.includes(s.id) ? "Remover" : "Adicionar"} ${s.name} ${favorites.includes(s.id) ? "dos" : "aos"} favoritos`}
                        >
                          <Icon name="star" size={17} />
                        </button>
                      </div>
                      <a className="card-link" href={`#/sistema/${s.id}`}>
                        <img
                          className="portal-card-image"
                          src={`/images/portals/${s.id}.webp`}
                          alt=""
                          width="840"
                          height="1260"
                          loading={i < 2 ? "eager" : "lazy"}
                          decoding="async"
                        />
                        <div className="portal-card-content">
                          <Sigil kind={s.kind} className="portal-card-sigil" />
                          <div className="card-name">
                            <h3>{s.name}</h3>
                            <span className="portal-edition">
                              {s.editionLabel}
                            </span>
                            <span className="portal-subtitle">
                              {s.subtitle}
                            </span>
                          </div>
                          <p>{s.description}</p>
                          <span className="portal-enter">
                            <Icon name="arrow" size={20} />
                            <span>Explorar sistema</span>
                          </span>
                        </div>
                      </a>
                    </article>
                  ))}
                </section>
              ) : (
                <div className="empty-state">
                  <Icon
                    name={view === "favorites" ? "star" : "search"}
                    size={34}
                  />
                  <h3>
                    {view === "favorites" && !favorites.length
                      ? "Seu acervo pessoal começa aqui"
                      : "Nenhum sistema por aqui"}
                  </h3>
                  <p>
                    {view === "favorites" && !favorites.length
                      ? "Use a estrela nos cartões para guardar seus sistemas favoritos."
                      : "Tente outra edição ou remova o filtro."}
                  </p>
                  <button
                    className="button"
                    onClick={() => {
                      setEdition("Todas as edições");
                      if (!favorites.length) setView("all");
                    }}
                  >
                    Explorar todos os sistemas
                  </button>
                </div>
              )}
              <section
                className="portal-shortcuts"
                aria-label="Explorar por assunto"
              >
                {[
                  {
                    name: "Lore",
                    slug: "lore",
                    icon: "book",
                    description:
                      "Histórias, facções e os segredos de cada mundo.",
                  },
                  {
                    name: "Mecânica",
                    slug: "mecanica",
                    icon: "mechanics",
                    description: "Regras, poderes e testes para a sua crônica.",
                  },
                  {
                    name: "Ficha",
                    slug: "ficha",
                    icon: "sheet",
                    description: "Personagens, atributos e próximos capítulos.",
                  },
                ].map((area) => (
                  <details
                    className={`portal-shortcut shortcut-${area.slug}`}
                    key={area.slug}
                  >
                    <summary>
                      <Icon name={area.icon} size={35} />
                      <span>
                        <strong>{area.name}</strong>
                        <span>{area.description}</span>
                      </span>
                      <Icon name="arrow" />
                    </summary>
                    <div className="shortcut-systems">
                      {systems.map((system) => (
                        <a
                          key={system.id}
                          href={`#/sistema/${system.id}/${area.slug}`}
                        >
                          <SystemLabel system={system} />
                          <Icon name="arrow" size={14} />
                        </a>
                      ))}
                    </div>
                  </details>
                ))}
              </section>
            </>
          )}
          <footer className="footer">
            <span>
              ARQUIVO DAS TREVAS <span className="footer-diamond">◇</span> Feito
              para quem conta histórias.
            </span>
            <span>
              Projeto de fãs · Sem vínculo oficial com World of Darkness
              {" · "}
              <a href="#/contato">Contato</a>
              {" · "}
              <a href="#/privacidade">Privacidade</a>
              {" · "}
              <button
                className="footer-about"
                onClick={() => setSettingsOpen(true)}
              >
                Preferências de privacidade
              </button>
              {" · "}
              <button
                className="footer-about"
                onClick={() => navigate("about")}
              >
                Sobre o projeto
              </button>
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
function About() {
  return (
    <div className="about-page">
      <div className="eyebrow">DE FÃS PARA FÃS</div>
      <h1>
        Um lugar para suas
        <br />
        próximas histórias.
      </h1>
      <p>
        O Arquivo das Trevas é uma base independente para organizar informações
        sobre os jogos do Mundo das Trevas. Aqui, cada sistema tem seu espaço e
        cada referência pode indicar sua edição e origem.
      </p>
      <div className="about-cards">
        <section>
          <Icon name="book" />
          <h2>Um acervo em construção</h2>
          <p>
            O acervo reúne explicações por assunto, textos integrais dos PDFs e
            estruturas de ficha. Cada entrada indica sua fonte, edição e
            limitações. Materiais ainda inacessíveis ficam identificados como
            pendentes.
          </p>
        </section>
        <section>
          <Icon name="book" />
          <h2>Referências para sua mesa</h2>
          <p>
            Explore lore, regras e poderes por sistema e edição. Use as fichas
            para anotar seus personagens e guardar uma cópia no seu navegador.
          </p>
        </section>
      </div>
      <p className="legal-copy">
        Projeto não oficial, sem afiliação com a Paradox Interactive ou suas
        editoras. World of Darkness e os nomes dos jogos pertencem aos
        respectivos titulares. Os símbolos deste site são ilustrações
        geométricas próprias.
      </p>
    </div>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PrivacyProvider systems={initialContent}>
      <App />
    </PrivacyProvider>
  </React.StrictMode>,
);
