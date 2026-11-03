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
  const marker = route.indexOf("?");
  const params = new URLSearchParams(
    marker >= 0 ? route.slice(marker + 1) : "",
  );
  const id = params.get("sistema") || "";
  const area = params.get("area") || "";
  const edition = params.get("edicao") || "";
  const number = Number(params.get("pagina") || 1);
  return {
    query: (params.get("q") || "").slice(0, 200),
    systemId: systems.some((system) => system.id === id) ? id : "",
    area: ["lore", "mechanics", "sheet", "system"].includes(area) ? area : "",
    edition: compatibleSearchEdition(systems, id, edition),
    group: (params.get("categoria") || "").slice(0, 150),
    page: Number.isSafeInteger(number) && number > 0 ? number : 1,
  };
}

export function searchEditions(systems, systemId = "") {
  const selected = systems.filter(
    (system) => !systemId || system.id === systemId,
  );
  return [
    ...new Set(
      (selected.length ? selected : systems).map(
        (system) => system.editionLabel,
      ),
    ),
  ];
}

export function compatibleSearchEdition(systems, systemId, edition) {
  const available = searchEditions(systems, systemId);
  if (!edition || available.includes(edition)) return edition || "";
  return systems.some((system) => system.id === systemId) &&
    available.length === 1
    ? available[0]
    : "";
}
