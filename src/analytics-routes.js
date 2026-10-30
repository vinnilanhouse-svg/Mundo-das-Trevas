import { articleHref, groupHref } from "./library-routes.js";

// Only public, known routes can enter statistics. No search strings or arbitrary hashes.
export function createAnalyticsRoutes(systems, documents = []) {
  const routes = new Map([
    ["", "/"],
    ["#", "/"],
    ["#/", "/"],
    ["#/contato", "/contato"],
    ["#/privacidade", "/privacidade"],
  ]);
  const canonical = new Set();
  const add = (hash, path = hash.slice(1)) => {
    const normalized = new URL(path, "https://acervo.invalid").pathname;
    routes.set(hash, normalized);
  };
  for (const system of systems) {
    const base = `#/sistema/${system.id}`;
    add(base);
    for (const area of ["lore", "mecanica", "ficha", "documentos"])
      add(`${base}/${area}`);
    for (const entry of system.sections) {
      add(articleHref(system.id, entry));
      add(groupHref(system.id, entry.category, entry.group));
    }
  }
  for (const path of routes.values()) canonical.add(path);
  const books = new Map(
    documents.map((book) => [
      `#/sistema/${book.system}/documentos/${book.sourceId}`,
      book.pages,
    ]),
  );
  for (const book of books.keys()) canonical.add(book.slice(1));
  return {
    pathFor(hash) {
      if (typeof hash !== "string" || hash.length > 4096) return null;
      if (routes.has(hash)) return routes.get(hash);
      const match = hash.match(
        /^(#\/sistema\/[^/]+\/documentos\/[^/]+)\/(\d+)$/,
      );
      if (!match) return null;
      const total = books.get(match[1]);
      const page = Number(match[2]);
      return total && page >= 1 && page <= total ? match[1].slice(1) : null;
    },
    cleanEvent(event, origin) {
      if (event.type !== "pageview") return null;
      try {
        const url = new URL(event.url, origin);
        if (url.origin !== origin || !canonical.has(url.pathname)) return null;
        return { ...event, url: `${origin}${url.pathname}` };
      } catch {
        return null;
      }
    },
  };
}
