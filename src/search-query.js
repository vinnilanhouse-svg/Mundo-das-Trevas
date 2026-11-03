export const normalizeSearch = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Connecting words are not rule concepts. Keep negation, attributes and power names.
const connecting = new Set(
  "a o as os de da do das dos e em no na nos nas um uma uns umas sobre para por com ao aos a pela pelo pelas pelos".split(
    " ",
  ),
);
const questionPrefix =
  /^(?:(?:por favor|pfv|ola|oi)\s+|(?:me\s+)?(?:explique|explica|mostre|mostra|diga)\s+|(?:o que|o q|oq)\s+(?:e|sao|significa|significam)\s+|(?:qual|quais)\s+(?:(?:e|sao)\s+)?|(?:como|onde|quando)\s+(?:(?:eu|a gente)\s+)?(?:(?:faco|fazer|posso|podemos|funciona|funcionam|usar|uso|utilizo|utilizar|encontro|encontrar|consulto|consultar|rolo|rolar|lanco|lancar|conjuro|conjurar|ativo|ativar)\s+)*)/;
const synonymGroups = [
  ["teste", "testes", "rolagem", "rolagens", "rolar"],
  ["arcanoi", "arcano", "arcanos", "arcanois"],
  ["arte", "artes"],
  ["esfera", "esferas"],
  ["habilidade", "habilidades"],
  ["disciplina", "disciplinas"],
  ["antecedente", "antecedentes"],
  ["poder", "poderes"],
  ["pericia", "pericias"],
  ["distincao", "distincoes"],
  ["trunfo", "trunfos"],
];
const synonyms = new Map(
  synonymGroups.flatMap((group) => group.map((term) => [term, group])),
);
export const searchTitleTerms = (title) =>
  normalizeSearch(title)
    .split(" ")
    .filter((word) => !connecting.has(word))
    .join(" ");

export function interpretSearchQuery(query) {
  const original = normalizeSearch(query);
  let phrase = original;
  let previous;
  do {
    previous = phrase;
    phrase = phrase.replace(questionPrefix, "").trim();
  } while (phrase !== previous);
  const words = [
    ...new Set(
      phrase.split(" ").filter((word) => word && !connecting.has(word)),
    ),
  ];
  return {
    original,
    phrase: words.join(" "),
    terms: words.map((word) => ({
      word,
      alternatives: synonyms.get(word) || [word],
    })),
  };
}
