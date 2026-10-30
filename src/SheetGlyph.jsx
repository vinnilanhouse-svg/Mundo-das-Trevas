import React from "react";

// Original decorative symbols. The adjacent field name carries the meaning.
const glyphs = {
  identity: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M5 21v-3a7 7 0 0 1 14 0v3M3 3h18v18H3z" />
    </>
  ),
  physical: (
    <>
      <path d="m4 18 4-5 4 1 4-7 4 2M8 13 6 8l4-4 4 2M12 14l-1 7M16 7l-3-3" />
      <circle cx="18" cy="3" r="2" />
    </>
  ),
  social: (
    <>
      <circle cx="12" cy="6" r="3" />
      <circle cx="4" cy="9" r="2" />
      <circle cx="20" cy="9" r="2" />
      <path d="M7 21v-5a5 5 0 0 1 10 0v5M1 20v-4a3 3 0 0 1 4-3M23 20v-4a3 3 0 0 0-4-3" />
    </>
  ),
  mental: (
    <>
      <path d="M12 4c-3-3-7 0-6 3-4 1-4 6-1 7-2 4 2 7 5 6l2-2 2 2c3 1 7-2 5-6 3-1 3-6-1-7 1-3-3-6-6-3ZM12 4v14M7 8l3 2M17 8l-3 2M6 14l3-1M18 14l-3-1" />
    </>
  ),
  skills: (
    <>
      <path d="m12 2 2 4 4-1 1 4 3 3-3 3-1 4-4-1-2 4-2-4-4 1-1-4-3-3 3-3 1-4 4 1Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  heart: (
    <path d="M12 21S2 15 2 8a5 5 0 0 1 10-2A5 5 0 0 1 22 8c0 7-10 13-10 13Z" />
  ),
  flame: (
    <path d="M12 2c2 7-5 7-3 12 1-3 3-4 5-5 0 4 5 5 5 9a7 7 0 0 1-14 0C3 12 10 8 12 2Z" />
  ),
  star: (
    <>
      <path d="m12 1 3 8 8 3-8 3-3 8-3-8-8-3 8-3ZM4 4l16 16M4 20 20 4" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  book: (
    <>
      <path d="M12 5c-4-3-7-3-10-2v16c4-1 7 0 10 3 3-3 6-4 10-3V3c-3-1-6-1-10 2ZM12 5v17M5 7l4 1M15 8l4-1M5 11l4 1M15 12l4-1" />
    </>
  ),
  chain: (
    <>
      <path d="m9 15 6-6M8 12l-3 3a4 4 0 0 0 6 6l4-4a4 4 0 0 0 0-6M16 12l3-3a4 4 0 0 0-6-6l-4 4a4 4 0 0 0 0 6" />
    </>
  ),
  temple: (
    <>
      <path d="m2 7 10-5 10 5ZM3 21h18M4 18h16M6 9v8M10 9v8M14 9v8M18 9v8" />
    </>
  ),
  spiral: (
    <path d="M20 18A11 11 0 1 1 22 8c3 8-6 15-12 10-5-4-1-11 4-9 4 1 3 7-1 7-3 0-3-4-1-4" />
  ),
  moon: <path d="M21 15A10 10 0 0 1 9 2a10 10 0 1 0 12 13Z" />,
  eye: (
    <>
      <path d="M1 12s5-8 11-8 11 8 11 8-5 8-11 8S1 12 1 12Z" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  cube: (
    <>
      <path d="m12 1 10 5v12l-10 5-10-5V6ZM2 6l10 5 10-5M12 11v12M7 4l10 5v11" />
    </>
  ),
  hourglass: (
    <>
      <path d="M5 2h14M5 22h14M6 2c0 6 2 7 6 10-4 3-6 4-6 10M18 2c0 6-2 7-6 10 4 3 6 4 6 10M8 18h8M8 6h8" />
    </>
  ),
  life: (
    <>
      <path d="M12 23V10M12 15C3 17 1 10 4 5c5 0 8 4 8 10ZM12 12c9 2 11-5 8-10-5 0-8 4-8 10Z" />
    </>
  ),
  rings: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 0v5M12 19v5M0 12h5M19 12h5" />
    </>
  ),
  anchor: (
    <>
      <path d="M12 7v15M8 12h8M3 15c0 9 18 9 18 0M1 17l2-3 3 2M18 16l3-2 2 3" />
      <circle cx="12" cy="4" r="3" />
    </>
  ),
  trident: (
    <>
      <path d="M12 1v22M5 5v6a7 7 0 0 0 14 0V5M2 7l3-4 3 4M16 7l3-4 3 4M9 4l3-3 3 3" />
    </>
  ),
  phases: (
    <>
      <circle cx="12" cy="12" r="5" />
      <path d="M3 4a9 9 0 0 1 0 16M21 4a9 9 0 0 0 0 16M3 7a6 6 0 0 1 0 10M21 7a6 6 0 0 0 0 10" />
    </>
  ),
  triangle: (
    <>
      <path d="m12 2 11 19H1ZM12 8l6 10H6Z" />
      <circle cx="12" cy="14" r="1" />
    </>
  ),
  quill: (
    <>
      <path d="M3 22 17 5M6 17C2 7 11 1 22 2c-1 10-8 19-16 15ZM8 12l5 1M12 7l1 6 5-1" />
    </>
  ),
};

const exact = {
  Físicos: "physical",
  Físicas: "physical",
  Sociais: "social",
  Mentais: "mental",
  Talentos: "quill",
  Perícias: "skills",
  Conhecimentos: "book",
  Correspondência: "rings",
  Entropia: "hourglass",
  Espírito: "flame",
  Forças: "triangle",
  Matéria: "cube",
  Mente: "eye",
  Primórdio: "spiral",
  Tempo: "hourglass",
  Vida: "life",
};

export function SheetGlyph({ name = "", systemId }) {
  let key = exact[name];
  if (systemId === "aparicao") {
    if (key === "physical") key = "anchor";
    if (key === "social") key = "trident";
    if (key === "mental") key = "star";
  }
  if (systemId === "mago") {
    if (key === "social") key = "phases";
    if (key === "mental") key = "eye";
  }
  if (!key) {
    const label = name.toLocaleLowerCase("pt-BR");
    key = /identidade/.test(label)
      ? "identity"
      : /vitalidade|corpus|paix/.test(label)
        ? "heart"
        : /vontade|pathos|ímpeto/.test(label)
          ? "flame"
          : /grilh|vínculo/.test(label)
            ? "chain"
            : /habilidade|perícia/.test(label)
              ? "skills"
              : /antecedente|pilar/.test(label)
                ? "temple"
                : /sombra|angústia/.test(label)
                  ? "moon"
                  : /arcanoi|disciplina|sangue/.test(label)
                    ? "spiral"
                    : /história|anota|prática/.test(label)
                      ? "quill"
                      : "star";
  }
  return (
    <svg
      className="sheet-glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyphs[key]}
    </svg>
  );
}

export function SheetAstralScale() {
  return (
    <svg className="sheet-wheel-scale" viewBox="0 0 240 240" aria-hidden="true">
      {Array.from({ length: 20 }, (_, i) => {
        const angle = ((i * 18 - 90) * Math.PI) / 180;
        return (
          <text
            key={i}
            x={120 + 112 * Math.cos(angle)}
            y={123 + 112 * Math.sin(angle)}
            textAnchor="middle"
          >
            {i + 1}
          </text>
        );
      })}
    </svg>
  );
}
