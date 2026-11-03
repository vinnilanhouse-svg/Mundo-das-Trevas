// Quotes published rules only. Missing fields never imply a free or automatic power.
function excerpt(parts, predicate) {
  for (const part of parts.filter(Boolean)) {
    const sentences =
      String(part)
        .replace(/\s+/g, " ")
        .match(/[^.!?]+(?:[.!?](?=\s|$)|$)/g) || [];
    const sentence = sentences.find(predicate);
    if (sentence) {
      const text = sentence.trim();
      return {
        text: text.slice(0, 500) + (text.length > 500 ? "…" : ""),
        quoted: true,
      };
    }
  }
  return null;
}
export function resistanceSummary(power) {
  if (power.resistance?.trim())
    return { text: power.resistance, quoted: false };
  return (
    excerpt(
      [
        power.rules,
        power.roll,
        ...(power.rollNotes || []).map((note) => note.text),
      ],
      (text) =>
        /\b(resist[êei][a-zà-ÿ]*|esquiva[a-zà-ÿ]*|contram[aá]g[a-zà-ÿ]*|opost[oa]s?|disputa[a-zà-ÿ]*|absor[çc][a-zà-ÿ]*)\b/i.test(
          text,
        ),
    ) || {
      text: "Consulte as condições e exceções na resolução completa e na fonte.",
      quoted: false,
    }
  );
}
export function powerFacts(power) {
  const field = (value) =>
    typeof value === "string" && value.trim() && !/^[–—-]$/.test(value.trim())
      ? { text: value }
      : null;
  const fallback = () => ({
    text: "Consulte a resolução completa e a fonte deste poder.",
  });
  const costQuote = () =>
    excerpt([power.rules], (text) =>
      /\b(gasta|gastam|gastar|custa|custam|paga|pagar)\b.{0,100}(?:\d+|um|uma|dois|duas|três|quatro|cinco).{0,60}\b(?:Pathos|Glamour|Quintessência|Força de Vontade|Angústia|Sangue)\b/i.test(
        text,
      ),
    );
  const durationQuote = () =>
    excerpt([power.rules], (text) =>
      /\b(?:dura|duram|durará|perdura|permanece ativo|permanece ativa)\b.{0,80}(?:turno|cena|dia|hora|minuto|permanente)/i.test(
        text,
      ),
    );
  return [
    {
      id: "roll",
      label: "Rolagem / teste",
      ...(field(power.roll) || fallback()),
    },
    {
      id: "cost",
      label: "Custo",
      ...(field(power.cost) || costQuote() || fallback()),
    },
    {
      id: "resistance",
      label: "Resistência / oposição",
      ...resistanceSummary(power),
    },
    {
      id: "duration",
      label: "Duração",
      ...(field(power.duration) || durationQuote() || fallback()),
    },
  ];
}
