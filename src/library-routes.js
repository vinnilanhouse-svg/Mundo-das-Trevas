const areas = { mechanics: "mecanica", lore: "lore", sheet: "ficha" };
export const articleHref = (systemId, article) =>
  `#/sistema/${systemId}/${areas[article.category]}/${article.id}`;
export const groupHref = (systemId, category, group) =>
  `#/sistema/${systemId}/${areas[category]}/categoria/${encodeURIComponent(group)}`;
export function routeGroup(route, sections) {
  const parts = route.split("/");
  if (parts[4] !== "categoria") return null;
  try {
    const name = decodeURIComponent(parts[5] || "");
    return sections.some((section) => section.group === name) ? name : null;
  } catch {
    return null;
  }
}
