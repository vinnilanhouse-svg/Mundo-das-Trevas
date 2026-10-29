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
  return {
    ...values,
    titleText: normalizeSearch(values.title),
    contextText: normalizeSearch(
      `${values.systemName} ${values.category} ${values.group || ""} ${values.aliases || ""}`,
    ),
    bodyText: normalizeSearch(values.text),
  };
}

// Build once from published content, never from private character sheets or localStorage.
export function createArchiveIndex(systems) {
  return systems.flatMap((system) => {
    const systemName = `${system.name} ${system.editionLabel}`;
    const common = { systemId: system.id, systemName };
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
  const phrase = normalizeSearch(query);
  if (!phrase || !Number.isFinite(limit) || limit <= 0) return [];
  const tokens = [...new Set(phrase.split(" "))];
  return index
    .filter((item) => !systemId || item.systemId === systemId)
    .map((item) => ({ ...item, score: relevance(item, phrase, tokens) }))
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.title.localeCompare(b.title, "pt-BR") ||
        a.id.localeCompare(b.id),
    )
    .slice(0, Math.min(5, Math.floor(limit)));
}
