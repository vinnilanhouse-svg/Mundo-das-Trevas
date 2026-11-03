export function searchHref(
  query,
  { systemId = "", area = "", edition = "", group = "", page = 1 } = {},
) {
  const params = new URLSearchParams();
  params.set("q", String(query).trim().slice(0, 200));
  if (systemId) params.set("sistema", systemId);
  if (area) params.set("area", area);
  if (edition) params.set("edicao", edition);
  if (group) params.set("categoria", group);
  if (page > 1) params.set("pagina", String(page));
  return `#/busca?${params}`;
}
export function parseSearchRoute(route, systems) {
  const params = new URLSearchParams(route.split("?")[1] || "");
  const id = params.get("sistema") || "";
  const area = params.get("area") || "";
  const edition = params.get("edicao") || "";
  const number = Number(params.get("pagina") || 1);
  return {
    query: (params.get("q") || "").slice(0, 200),
    systemId: systems.some((system) => system.id === id) ? id : "",
    area: ["lore", "mechanics", "sheet", "system"].includes(area) ? area : "",
    edition: systems.some((system) => system.editionLabel === edition)
      ? edition
      : "",
    group: (params.get("categoria") || "").slice(0, 150),
    page: Number.isSafeInteger(number) && number > 0 ? number : 1,
  };
}
