// Layouts follow the received blank forms; field IDs and saved values stay unchanged.
const attributeGroups = [
  "Atributos físicos",
  "Atributos sociais",
  "Atributos mentais",
];
const palettes = {
  vampiro: "#87283f",
  changeling: "#47734e",
  cacador: "#9c612b",
  mago: "#694390",
  aparicao: "#466858",
};

export function getSheetLayout(system) {
  const fields = new Map(
    system.sheet.groups.flatMap((g) =>
      g.fields.map((f) => [f.id, { ...f, kind: g.kind }]),
    ),
  );
  const used = new Set();
  const block = (title, ids, options = {}) => ({
    title,
    ...options,
    fields: ids.map((id) => {
      if (!fields.has(id) || used.has(id))
        throw new Error(`Campo de ficha inválido ou repetido: ${id}`);
      used.add(id);
      return fields.get(id);
    }),
  });
  const group = (title, label = title, options = {}) =>
    block(
      label,
      system.sheet.groups
        .find((g) => g.title === title)
        .fields.map((f) => f.id),
      options,
    );
  const each = (title) =>
    system.sheet.groups
      .find((g) => g.title === title)
      .fields.map((f) => block(f.label, [f.id]));
  const section = (title, columns, weights) => ({ title, columns, weights });
  const band = (title, blocks) =>
    section(
      title,
      blocks.map((b) => [b]),
    );
  const identity = (columns) =>
    section(
      "Identidade",
      columns.map((ids) => [block("", ids)]),
    );
  const attributes = () =>
    band(
      "Atributos",
      attributeGroups.map((g, i) =>
        group(g, ["Físicos", "Sociais", "Mentais"][i]),
      ),
    );
  const skills = () =>
    band(
      "Habilidades",
      system.id === "vampiro" || system.id === "cacador"
        ? [
            "Habilidades físicas",
            "Habilidades sociais",
            "Habilidades mentais",
          ].map((g, i) => group(g, ["Físicas", "Sociais", "Mentais"][i]))
        : ["Talentos", "Perícias", "Conhecimentos"].map((g) => {
            const ids = system.sheet.groups.find((x) => x.title === g).fields;
            return block(
              g,
              (system.id === "mago"
                ? [...ids].sort((a, b) =>
                    a.label.localeCompare(b.label, "pt-BR"),
                  )
                : ids
              ).map((f) => f.id),
            );
          }),
    );
  const id = (name) => `identidade-${name}`;
  const xp = () => group("Experiência");
  const pages = [];
  const page = (title, sections) => pages.push({ title, sections });

  if (system.id === "vampiro") {
    page("Personagem", [
      identity([
        [id("nome"), id("cronica"), id("senhor")],
        [id("conceito"), id("ambicao"), id("desejo")],
        [id("predador"), id("cla"), id("geracao")],
      ]),
      attributes(),
      band("Vitalidade e Força de Vontade", each("Trilhas")),
      skills(),
      band("Disciplinas", each("Disciplinas")),
      band("Sangue e condição", [
        group("Sangue"),
        block("Humanidade", ["condicao-humanidade"]),
        group("Dano e condições"),
      ]),
    ]);
    page("Vantagens e história", [
      band("Convicções e vínculos", each("Convicções e vínculos")),
      section("Vantagens e trajetória", [
        [group("Antecedentes"), group("Qualidades e Defeitos")],
        [
          block("Potência de Sangue", ["condicao-potencia-de-sangue"]),
          xp(),
          ...each("Anotações"),
        ],
      ]),
    ]);
  } else if (system.id === "cacador") {
    page("Personagem", [
      identity([
        [id("nome"), id("celula")],
        [id("conceito"), id("ambicao")],
        [id("credo"), id("desejo")],
      ]),
      band("Ímpeto e Redenção", [
        block("", [id("impeto")]),
        block("", [id("redencao")]),
      ]),
      attributes(),
      band("Vitalidade, Força de Vontade e Aflição", [
        ...each("Trilhas"),
        group("Aflição e Redenção", "Aflição", { compact: true }),
      ]),
      skills(),
      band("Trunfos e Distinções", each("Trunfos e Distinções")),
    ]);
    page("Célula, vantagens e história", [
      band("Pilares e caçada", [
        block("Pilares", [id("pilares")]),
        ...each("Caçada"),
      ]),
      section("Vantagens e trajetória", [
        [group("Antecedentes"), group("Qualidades e Defeitos")],
        [group("Estado da célula"), xp(), ...each("Anotações")],
      ]),
    ]);
  } else if (system.id === "changeling") {
    page("Personagem", [
      identity([
        [id("nome"), id("jogador"), id("cronica")],
        [id("corte"), id("legado-seelie"), id("legado-unseelie"), id("casa")],
        [id("aspecto"), id("kith"), id("mixordia")],
      ]),
      attributes(),
      skills(),
      section("Vantagens e Temperamentos", [
        [
          group("Antecedentes"),
          block("Direitos Inatos e Fraquezas", [
            "natureza-feerica-direitos-inatos",
            "natureza-feerica-fraquezas",
          ]),
          block("Antítese", ["natureza-feerica-antitese"]),
          xp(),
        ],
        [
          group("Artes"),
          ...Array.from({ length: 3 }, (_, i) =>
            block(
              ["Glamour", "Força de Vontade", "Banalidade"][i],
              system.sheet.groups
                .find((g) => g.title === "Temperamentos — reservas")
                .fields.slice(i * 2, i * 2 + 2)
                .map((f) => f.id),
            ),
          ),
          group("Pesadelos"),
        ],
        [
          group("Alçadas"),
          group("Dano e condições", "Vitalidade real e quimérica"),
          block("Limiar de Inspiração / Extermínio", [
            "natureza-feerica-limiar-de-inspiracao-exterminio",
          ]),
        ],
      ]),
    ]);
    page("História e anotações", [
      band("Qualidades e Defeitos", each("Qualidades e Defeitos")),
      band("Equipamento e história", each("Anotações")),
    ]);
  } else if (system.id === "mago") {
    page("Personagem", [
      identity([
        [id("nome"), id("jogador"), id("cronica")],
        [id("natureza"), id("comportamento"), id("essencia")],
        [id("afiliacao"), id("faccao"), id("conceito")],
      ]),
      attributes(),
      skills(),
      band(
        "Esferas",
        [
          ["correspondencia", "entropia", "espirito"],
          ["forcas", "materia", "mente"],
          ["primordio", "tempo", "vida"],
        ].map((ids) =>
          block(
            "",
            ids.map((x) => `esferas-${x}`),
          ),
        ),
      ),
      section("Vantagens", [
        [
          group("Antecedentes"),
          block("Outras características", [
            "pratica-e-anotacoes-outras-caracteristicas",
          ]),
        ],
        [
          ...each("Trilhas"),
          group("Recursos mágicos", "Quintessência e Paradoxo"),
        ],
        [
          block("Vitalidade", ["pratica-e-anotacoes-vitalidade-e-condicoes"]),
          xp(),
        ],
      ]),
    ]);
    page("Foco e história", [
      band("Qualidades e Defeitos", each("Qualidades e Defeitos")),
      band("Foco", each("Foco e opções de mesa")),
      band("Prática e anotações", [
        block("Prática, instrumentos e efeitos", [
          "pratica-e-anotacoes-pratica-instrumentos-e-efeitos",
        ]),
        ...each("Anotações"),
      ]),
    ]);
  } else if (system.id === "aparicao") {
    page("Psique", [
      identity([
        [id("nome"), id("jogador"), id("cronica")],
        [id("natureza"), id("comportamento"), id("sombra")],
        [id("vida"), id("morte"), id("arrependimento")],
      ]),
      attributes(),
      skills(),
      section(
        "Vantagens",
        [[group("Antecedentes")], [group("Paixões")]],
        [1, 2],
      ),
      section("Arcanoi e recursos", [
        [group("Arcanoi")],
        [
          block("Corpus", ["trilhas-corpus"]),
          block("Força de Vontade", ["trilhas-forca-de-vontade"]),
          block("Pathos", ["trilhas-pathos"]),
        ],
        [group("Grilhões"), xp()],
      ]),
    ]);
    page("Sombra e história", [
      section("Sombra", [
        [
          block("Identidade da Sombra", [
            "sombra-arquetipo-da-sombra",
            "sombra-guia-da-sombra",
          ]),
        ],
        [group("Angústia")],
        [block("Paixões Sombrias", ["sombra-paixoes-sombrias"])],
      ]),
      band("Espinhos e condições", [
        block("Espinhos", ["sombra-espinhos-e-custos"]),
        group("Sombra e condições"),
      ]),
      band("Aprendizado de Arcanoi", each("Aprendizado de Arcanoi")),
      band("Qualidades e Defeitos", each("Qualidades e Defeitos")),
      band("Equipamento e história", each("Anotações")),
    ]);
  }
  // New or edition-specific fields never disappear just because a layout predates them.
  const remaining = system.sheet.groups
    .map((g) => ({ ...g, fields: g.fields.filter((f) => !used.has(f.id)) }))
    .filter((g) => g.fields.length);
  if (remaining.length) {
    const extra = band(
      "Campos complementares",
      remaining.map((g) =>
        block(
          g.title,
          g.fields.map((f) => f.id),
        ),
      ),
    );
    if (pages.length) pages.at(-1).sections.push(extra);
    else page("Personagem", [extra]);
  }
  return { accent: palettes[system.id] || "#65516f", pages };
}
