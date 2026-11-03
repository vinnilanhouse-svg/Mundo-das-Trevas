import { articleHref, groupHref, routeGroup } from "./library-routes.js";
export const FAVORITES_KEY = "arquivo-trevas-favorites-v1";
export const LIBRARY_KEY = "arquivo-trevas-library-v1";
export const RECENT_KEY = "arquivo-trevas-recent-v1";
export const RECENT_LIMIT = 40;
const areaNames = { lore: "Lore", mechanics: "Mecânica", sheet: "Ficha" };
const areas = { lore: "lore", mecanica: "mechanics", ficha: "sheet" };
const text = (value, length = 500) =>
  typeof value === "string" ? value.slice(0, length) : "";
export const emptyLibrary = () => ({ version: 1, collections: [], items: [] });
export function systemReference(system) {
  return {
    href: `#/sistema/${system.id}`,
    title: `${system.name} ${system.editionLabel}`,
    systemId: system.id,
    systemName: `${system.name} ${system.editionLabel}`,
    editionLabel: system.editionLabel,
    kind: "system",
    category: "Sistema",
    group: "",
  };
}
export function referenceForRoute(system, route, documents = []) {
  const base = `#/sistema/${system.id}`;
  const common = systemReference(system);
  if (route === base) return common;
  const parts = route.split("/");
  if (`#/${parts[1]}/${parts[2]}` !== base) return null;
  const area = areas[parts[3]];
  if (area) {
    const commonArea = { ...common, category: areaNames[area], kind: "area" };
    if (route === `${base}/${parts[3]}`)
      return {
        ...commonArea,
        href: route,
        title: `${areaNames[area]} — ${common.title}`,
      };
    const section = system.sections.find(
      (item) =>
        item.category === area && articleHref(system.id, item) === route,
    );
    if (section)
      return {
        ...commonArea,
        href: route,
        title: section.title,
        kind: "article",
        group: section.group,
      };
    const group = routeGroup(
      route,
      system.sections.filter((item) => item.category === area),
    );
    if (group && route === groupHref(system.id, area, group))
      return { ...commonArea, href: route, title: group, kind: "group", group };
    return null;
  }
  if (route === `${base}/documentos`)
    return {
      ...common,
      href: route,
      title: `Documentos — ${common.title}`,
      category: "Documentos",
      kind: "area",
    };
  const book = documents.find(
    (item) => item.system === system.id && item.sourceId === parts[4],
  );
  const page = Number(parts[5]);
  if (
    book &&
    Number.isInteger(page) &&
    page >= 1 &&
    page <= book.pages &&
    route === `${base}/documentos/${book.sourceId}/${page}`
  )
    return {
      ...common,
      href: route,
      title: `${book.title} · PDF p. ${page}`,
      category: "Documentos",
      kind: "document",
    };
  return null;
}
export function safeReference(value, systems) {
  if (!value || typeof value !== "object") return null;
  const system = systems.find((item) => item.id === value.systemId);
  if (
    !system ||
    typeof value.title !== "string" ||
    !value.title.trim() ||
    typeof value.href !== "string" ||
    value.href.length > 1500
  )
    return null;
  const base = `#/sistema/${system.id}`;
  const suffix = value.href.slice(base.length);
  if (
    !value.href.startsWith(base) ||
    !/^(?:|\/(?:lore|mecanica|ficha)(?:\/[a-z0-9-]+|\/categoria\/[^/?#]+)?|\/documentos(?:\/[a-z0-9-]+\/[1-9]\d*)?)$/.test(
      suffix,
    )
  )
    return null;
  return {
    ...systemReference(system),
    href: value.href,
    title: text(value.title),
    kind: ["system", "area", "article", "group", "document"].includes(
      value.kind,
    )
      ? value.kind
      : "article",
    category: text(value.category, 50),
    group: text(value.group, 150),
  };
}
export function normalizeLibrary(value, systems) {
  if (
    !value ||
    value.version !== 1 ||
    !Array.isArray(value.items) ||
    !Array.isArray(value.collections)
  )
    return null;
  const collections = [];
  for (const collection of value.collections.slice(0, 50)) {
    const name = text(collection?.name, 60).trim();
    if (
      !name ||
      !/^[a-zA-Z0-9-]{1,100}$/.test(collection?.id || "") ||
      collections.some(
        (item) =>
          item.id === collection.id ||
          item.name.toLocaleLowerCase("pt-BR") ===
            name.toLocaleLowerCase("pt-BR"),
      )
    )
      continue;
    collections.push({ id: collection.id, name });
  }
  const items = [];
  for (const item of value.items.slice(0, 5000)) {
    const reference = safeReference(item, systems);
    if (!reference || items.some((saved) => saved.href === reference.href))
      continue;
    const collectionIds = [
      ...new Set(Array.isArray(item.collectionIds) ? item.collectionIds : []),
    ].filter((id) => collections.some((collection) => collection.id === id));
    items.push({ ...reference, collectionIds });
  }
  return { version: 1, collections, items };
}
export function readLibrary(storage, systems) {
  const current = normalizeLibrary(
    JSON.parse(storage.getItem(LIBRARY_KEY) || "null"),
    systems,
  );
  if (current) return current;
  const legacy = JSON.parse(storage.getItem(FAVORITES_KEY) || "[]");
  const items = systems
    .filter((system) => Array.isArray(legacy) && legacy.includes(system.id))
    .map((system) => ({ ...systemReference(system), collectionIds: [] }));
  return { ...emptyLibrary(), items };
}
export function updateLibrary(state, action) {
  if (action.type === "toggle")
    return {
      ...state,
      items: state.items.some((item) => item.href === action.entry.href)
        ? state.items.filter((item) => item.href !== action.entry.href)
        : [{ ...action.entry, collectionIds: [] }, ...state.items],
    };
  if (action.type === "membership")
    return {
      ...state,
      items: state.items.map((item) =>
        item.href === action.href
          ? {
              ...item,
              collectionIds: action.checked
                ? [...new Set([...item.collectionIds, action.id])]
                : item.collectionIds.filter((id) => id !== action.id),
            }
          : item,
      ),
    };
  if (action.type === "create")
    return {
      ...state,
      collections: [...state.collections, { id: action.id, name: action.name }],
    };
  if (action.type === "rename")
    return {
      ...state,
      collections: state.collections.map((collection) =>
        collection.id === action.id
          ? { ...collection, name: action.name }
          : collection,
      ),
    };
  if (action.type === "delete")
    return {
      ...state,
      collections: state.collections.filter(
        (collection) => collection.id !== action.id,
      ),
      items: state.items.map((item) => ({
        ...item,
        collectionIds: item.collectionIds.filter((id) => id !== action.id),
      })),
    };
  return state;
}
export function normalizeRecent(value, systems) {
  if (!Array.isArray(value)) return [];
  const items = [];
  for (const item of value) {
    const reference = safeReference(item, systems);
    if (
      !reference ||
      !Number.isSafeInteger(item.viewedAt) ||
      item.viewedAt < 0 ||
      Number.isNaN(new Date(item.viewedAt).getTime()) ||
      items.some((saved) => saved.href === reference.href)
    )
      continue;
    items.push({ ...reference, viewedAt: item.viewedAt });
  }
  return items.sort((a, b) => b.viewedAt - a.viewedAt).slice(0, RECENT_LIMIT);
}
export function visitRecent(items, entry, now = Date.now()) {
  return [
    { ...entry, viewedAt: now },
    ...items.filter((item) => item.href !== entry.href),
  ].slice(0, RECENT_LIMIT);
}
