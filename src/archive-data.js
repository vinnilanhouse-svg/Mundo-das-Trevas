import { useEffect, useState } from "react";
import catalog from "./generated/catalog.json";
export { catalog };

const requests = new Map();
function load(url) {
  if (!requests.has(url)) {
    requests.set(
      url,
      fetch(url)
        .then((response) => {
          if (!response.ok)
            throw new Error("Não foi possível carregar o acervo.");
          return response.json();
        })
        .catch((error) => {
          requests.delete(url);
          throw error;
        }),
    );
  }
  return requests.get(url);
}
export async function loadSystem(id) {
  const system = catalog.find((item) => item.id === id);
  if (!system) throw new Error("Sistema não encontrado.");
  const data = await load(system.dataUrl);
  if (
    data.id !== id ||
    !Array.isArray(data.sections) ||
    data.sections.length !== system.sectionCount
  ) {
    requests.delete(system.dataUrl);
    throw new Error("O conteúdo recebido está incompleto. Tente novamente.");
  }
  return data;
}
export async function loadSearchIndex(systemId = null) {
  const selected = systemId
    ? catalog.filter((system) => system.id === systemId)
    : catalog;
  const indexes = await Promise.all(
    selected.map(async (system) => {
      const index = await load(system.searchUrl);
      if (
        !Array.isArray(index) ||
        !index.every(
          (entry) =>
            entry.systemId === system.id &&
            typeof entry.href === "string" &&
            typeof entry.bodyText === "string",
        )
      ) {
        requests.delete(system.searchUrl);
        throw new Error("Índice de busca incompleto.");
      }
      return index;
    }),
  );
  return indexes.flat();
}
export function useSearchIndex(enabled, systemId = null) {
  const scope = systemId || "all";
  const [state, setState] = useState({});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setState({ scope, loading: true });
    loadSearchIndex(systemId).then(
      (index) => active && setState({ scope, index }),
      () =>
        active &&
        setState({
          scope,
          error:
            "Não foi possível carregar a busca. Confira sua conexão e tente novamente.",
        }),
    );
    return () => {
      active = false;
    };
  }, [enabled, scope, systemId, attempt]);
  return {
    ...(enabled && state.scope === scope ? state : { loading: enabled }),
    index: enabled && state.scope === scope ? state.index || [] : [],
    retry: () => setAttempt((value) => value + 1),
  };
}
