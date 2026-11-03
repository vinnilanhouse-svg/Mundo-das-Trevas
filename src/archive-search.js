import { articleHref, groupHref } from "./library-routes.js";

export const normalizeSearch = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const areaNames = { lore: "Lore", mechanics: "Mecânica", sheet: "Ficha" };
const flat = (text) =>
  String(text || "")
    .replace(/\s+/g, " ")
    .trim();

function entry(values) {
  const { text, aliases, ...metadata } = values;
  return {
    ...metadata,
    excerpt:
      values.excerpt.length > 280
        ? `${values.excerpt.slice(0, 277).replace(/\s+\S*$/, "")}…`
        : values.excerpt,
    titleText: normalizeSearch(values.title),
    contextText: normalizeSearch(
      `${values.systemName} ${values.category} ${values.group || ""} ${values.aliases || ""}`,
    ),
    // Ranking uses individual body words, so store repeated words only once.
    bodyText: [...new Set(normalizeSearch(text).split(" "))].join(" "),
  };
}

// Build once from published content, never from private character sheets or localStorage.
export function createArchiveIndex(systems) {
  return systems.flatMap((system) => {
    const systemName = `${system.name} ${system.editionLabel}`;
    const common = {
      systemId: system.id,
      systemName,
      editionLabel: system.editionLabel,
    };
    const groups = new Map();
    const articles = system.sections.map((section) => {
      const key = `${section.category}/${section.group}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(section);
      const power = section.power;
      const text = [
        section.intro,
        section.body,
        power?.family,
        power?.roll,
        power?.cost,
        power?.duration,
        power?.requirements,
        power?.resistance,
        power?.rules,
        ...(power?.rollNotes || []).map((note) => note.text),
      ]
        .filter(Boolean)
        .join(" ");
      return entry({
        ...common,
        id: `${system.id}/article/${section.id}`,
        kind: "article",
        title: section.title,
        category: areaNames[section.category],
        area: section.category,
        group: section.group,
        href: articleHref(system.id, section),
        excerpt: flat(section.body),
        text,
      });
    });
    const indexes = [...groups.values()].map((sections) => {
      const { category, group } = sections[0];
      return entry({
        ...common,
        id: `${system.id}/group/${category}/${group}`,
        kind: "group",
        title: group,
        category: areaNames[category],
        area: category,
        group,
        href: groupHref(system.id, category, group),
        excerpt: `${sections.length} ${sections.length === 1 ? "tópico organizado" : "tópicos organizados"}. Consulte o índice de ${group}.`,
        // Topic titles are enough to describe an index; full bodies belong to individual results.
        text: sections.map((section) => section.title).join(" "),
        aliases: group === "Arcanoi" ? "arcanos arcanois" : "",
      });
    });
    return [
      entry({
        ...common,
        id: `${system.id}/system`,
        kind: "system",
        title: systemName,
        category: "Sistema",
        area: "system",
        href: `#/sistema/${system.id}`,
        excerpt: system.description,
        text: `${system.subtitle} ${system.original} ${system.theme}`,
      }),
      ...indexes,
      ...articles,
    ];
  });
}

function hasWord(text, token) {
  return (
    text === token ||
    text.startsWith(`${token} `) ||
    text.endsWith(` ${token}`) ||
    text.includes(` ${token} `)
  );
}

function relevance(item, phrase, tokens) {
  // Every keyword must occur. Titles and indexes precede incidental mentions in long rules.
  if (
    !tokens.every((token) =>
      `${item.titleText} ${item.contextText} ${item.bodyText}`.includes(token),
    )
  )
    return 0;
  let score = 0;
  if (item.titleText === phrase) score += 1000;
  else if (item.titleText.startsWith(phrase)) score += 500;
  else if (item.titleText.includes(phrase)) score += 350;
  if (tokens.every((token) => item.titleText.includes(token))) score += 200;
  for (const token of tokens) {
    if (hasWord(item.titleText, token)) score += 80;
    else if (item.titleText.includes(token)) score += 35;
    if (hasWord(item.contextText, token)) score += 12;
    if (hasWord(item.bodyText, token)) score += 2;
  }
  if (item.kind === "group") score += 15;
  if (item.kind === "system") score += 8;
  return score;
}

export function searchArchive(
  index,
  query,
  { systemId = null, limit = 5 } = {},
) {
  if (!Number.isFinite(limit) || limit <= 0) return [];
  return queryArchive(index, query, {
    systemId,
    limit: Math.min(5, Math.floor(limit)),
  }).items;
}

export function queryArchive(
  index,
  query,
  {
    systemId = null,
    area = null,
    edition = null,
    group = null,
    offset = 0,
    limit = 20,
  } = {},
) {
  const phrase = normalizeSearch(query);
  if (!phrase) return { items: [], total: 0 };
  const tokens = [...new Set(phrase.split(" "))];
  const results = index
    .filter((item) => !systemId || item.systemId === systemId)
    .filter((item) => !area || item.area === area)
    .filter((item) => !edition || item.editionLabel === edition)
    .filter((item) => !group || item.group === group)
    .map((item) => ({ ...item, score: relevance(item, phrase, tokens) }))
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.title.localeCompare(b.title, "pt-BR") ||
        a.id.localeCompare(b.id),
    );
  const start = Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0;
  const size = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 20;
  return { items: results.slice(start, start + size), total: results.length };
}
