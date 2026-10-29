import documents from "./documents.json" with { type: "json" };

export { documents };

export function bookPageLabel(document, number) {
  if (!Number.isInteger(document.printedStart)) return "";
  const printed = document.printedStart + number - 1;
  return printed === 0 ? "abertura do livro" : `livro p. ${printed}`;
}

export const normalizeText = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export function citedPages(reference, total) {
  const pages = new Set();
  for (const match of reference.matchAll(/(\d+)(?:\s*[-–—]\s*(\d+))?/g)) {
    const start = Number(match[1]);
    const end = Math.min(Number(match[2] || start), total);
    for (let number = Math.max(1, start); number <= end; number++)
      pages.add(number);
  }
  return [...pages].sort((a, b) => a - b);
}

export function searchPages(pages, query) {
  const needle = normalizeText(query);
  if (!needle) return [];
  return pages.flatMap((page) => {
    const flat = page.text.replace(/\s+/g, " ").trim();
    const index = normalizeText(flat).indexOf(needle);
    return index < 0
      ? []
      : [
          {
            number: page.number,
            excerpt: `${index > 70 ? "…" : ""}${flat.slice(Math.max(0, index - 70), index + needle.length + 150)}${index + needle.length + 150 < flat.length ? "…" : ""}`,
          },
        ];
  });
}

const requests = new Map();
export function loadDocument(sourceId) {
  const document = documents.find((item) => item.sourceId === sourceId);
  if (!document) return Promise.reject(new Error("Documento indisponível."));
  if (!requests.has(sourceId)) {
    requests.set(
      sourceId,
      fetch(document.textUrl)
        .then((response) => {
          if (!response.ok)
            throw new Error("Não foi possível carregar o texto do PDF.");
          return response.json();
        })
        .then((data) => {
          if (
            data.sourceId !== sourceId ||
            !Array.isArray(data.pages) ||
            data.pages.length !== document.pages ||
            !data.pages.every(
              (page, index) =>
                page.number === index + 1 && typeof page.text === "string",
            )
          ) {
            throw new Error("O documento recebido está incompleto.");
          }
          return data;
        })
        .catch((error) => {
          requests.delete(sourceId);
          throw error;
        }),
    );
  }
  return requests.get(sourceId);
}
