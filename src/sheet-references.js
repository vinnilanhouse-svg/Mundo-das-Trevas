import { articleHref, groupHref } from "./library-routes.js";
export const normalizeReferenceTerm = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function createSheetReferences(system) {
  const titles = new Map(),
    groups = new Map(),
    fieldGroups = new Map();
  const ordered = [...system.sections].sort(
    (a, b) =>
      (a.category === "mechanics" ? 0 : a.category === "lore" ? 1 : 2) -
      (b.category === "mechanics" ? 0 : b.category === "lore" ? 1 : 2),
  );
  for (const article of ordered) {
    const key = normalizeReferenceTerm(article.title);
    if (!titles.has(key)) titles.set(key, article);
    const gkey = `${article.category}:${normalizeReferenceTerm(article.group)}`;
    if (!groups.has(gkey)) groups.set(gkey, article.group);
  }
  for (const group of system.sheet.groups)
    for (const field of group.fields) fieldGroups.set(field.id, group.title);
  const topic = (title) => {
    const article = titles.get(normalizeReferenceTerm(title));
    return article
      ? {
          href: articleHref(system.id, article),
          title: article.title,
          kind: "article",
          id: article.id,
        }
      : null;
  };
  const category = (name, area = "mechanics") => {
    const group = groups.get(`${area}:${normalizeReferenceTerm(name)}`);
    return group
      ? {
          href: groupHref(system.id, area, group),
          title: group,
          kind: "group",
          group,
          category: area,
        }
      : null;
  };
  const first = (...items) => items.find(Boolean) || null;
  const creation = first(
    topic("Roteiro de criação"),
    topic("Roteiro de criação C20"),
    topic("Roteiro W20"),
    category("Criação de personagem"),
    category("Regras H5"),
    topic("Criação: Atributos e Habilidades"),
  );
  const identity = first(
    topic("Identidade"),
    topic("Identidade e conceito"),
    topic("Identidade feérica"),
    topic("Identidade e história"),
    topic("Como preencher a base H5"),
    creation,
  );
  const experience = first(
    topic("Experiência e progressão"),
    topic("Custos de experiência"),
    topic("Desenvolvimento da personagem"),
    category("Experiência"),
  );
  const health = first(
    topic("Vitalidade e dano"),
    topic("Vitalidade real e quimérica"),
    topic("Vitalidade e tipos de dano"),
    topic("Corpus e tipos de dano"),
    topic("Dano Superficial e Agravado"),
    category("Dano e combate"),
  );
  const willpower = first(
    topic("Força de Vontade"),
    topic("Pathos e Força de Vontade"),
    topic("Gastar Força de Vontade"),
    topic("Temperamentos e Aspecto"),
  );
  const backgrounds = first(
    category("Antecedentes"),
    category("Antecedentes H5"),
    topic("Antecedentes e outras características"),
  );
  const merits = first(
    category("Qualidades e Defeitos"),
    category("Qualidades e Defeitos H5"),
    topic("Vantagens e Defeitos"),
    category("Apêndices — texto do livro"),
  );
  const powers = first(
    category("Artes"),
    category("Esferas"),
    category("Disciplinas"),
    topic("Arcanoi"),
    topic("Trunfos, Distinções e criação"),
  );
  const focus = first(
    topic("Paradigma, prática e instrumentos"),
    topic("Como conjurar um Efeito"),
  );
  const resources = first(
    category("Recursos e condições"),
    category("Trilhas"),
    topic("Quintessência e Paradoxo"),
    category("Sangue e humanidade"),
    category("Regras H5"),
  );
  const aliases = new Map();
  const add = (terms, reference) => {
    for (const term of terms)
      aliases.set(normalizeReferenceTerm(term), reference);
  };
  add(
    [
      "Identidade",
      "Personagem",
      "História e anotações",
      "História e notas",
      "Anotações",
      "Vida",
      "Morte",
      "Arrependimento",
      "Nome",
      "Jogador",
      "Crônica",
      "Conceito",
      "Equipamento e história",
    ],
    identity,
  );
  add(
    [
      "Experiência",
      "Experiência disponível",
      "Experiência total",
      "Vantagens e trajetória",
    ],
    experience,
  );
  add(
    [
      "Vitalidade",
      "Vitalidade máxima",
      "Vitalidade real",
      "Vitalidade quimérica",
      "Dano e condições",
      "Dano superficial / agravado",
      "Máculas e condições",
      "Condições e dano",
    ],
    health,
  );
  add(
    [
      "Força de Vontade máxima",
      "Força de Vontade permanente",
      "Força de Vontade temporária",
      "Força de Vontade",
    ],
    willpower,
  );
  add(
    [
      "Antecedentes",
      "Antecedentes e níveis",
      "Antecedentes e outras características",
    ],
    backgrounds,
  );
  add(
    ["Qualidades e Defeitos", "Qualidades e custos", "Defeitos e custos"],
    merits,
  );
  add(
    [
      "Disciplinas e níveis",
      "Poderes e fontes",
      "Artes, níveis e truques",
      "Vantagens e poderes",
      "Vantagens",
    ],
    powers,
  );
  add(["Rituais e fórmulas"], first(category("Rituais e alquimia"), powers));
  add(
    [
      "Esferas opcionais",
      "Esfera opcional adotada, graduação e Esfera substituída",
    ],
    category("Esferas opcionais"),
  );
  add(
    [
      "Foco",
      "Foco e opções de mesa",
      "Prática e anotações",
      "Paradigma",
      "Práticas",
      "Instrumentos",
      "Prática, instrumentos e efeitos",
    ],
    focus,
  );
  add(
    [
      "Recursos mágicos",
      "Trilhas",
      "Sangue e condição",
      "Temperamentos — reservas",
      "Vantagens e Temperamentos",
    ],
    resources,
  );
  add(["Quintessência", "Paradoxo"], topic("Quintessência e Paradoxo"));
  add(["Fome"], topic("Fome e testes de Despertar"));
  add(["Potência de Sangue", "Geração"], topic("Potência de Sangue e Geração"));
  add(
    [
      "Humanidade",
      "Convicções",
      "Pilares",
      "Convicções e vínculos",
      "Convicções e relacionamentos",
    ],
    first(
      topic("Humanidade, Convicções e Pilares"),
      topic("Ambição, Desejo e Pilares"),
      identity,
    ),
  );
  add(
    ["Coterie e relacionamentos", "Relações da célula"],
    first(
      topic("Domínio da coterie"),
      topic("Mapa de Relacionamentos"),
      identity,
    ),
  );
  add(["Predador"], category("Tipos de predador"));
  add(["Clã"], category("Clãs", "lore"));
  add(["Credo"], category("Credos", "lore"));
  add(
    ["Ímpeto", "Ímpeto e Redenção", "Redenção"],
    first(category("Ímpetos e Redenção"), identity),
  );
  add(
    ["Aflição", "Aflição e Redenção", "Aflição ativa e condição de Redenção"],
    topic("Aflição e Redenção"),
  );
  add(
    [
      "Célula",
      "Estado da célula",
      "Célula, vantagens e história",
      "Caçada",
      "Pilares e caçada",
    ],
    first(
      topic("Mapa de Relacionamentos"),
      category("Cenário e Caçada", "lore"),
      identity,
    ),
  );
  add(
    ["Desespero", "Desespero, riscos e condições"],
    topic("Desespero da célula"),
  );
  add(["Perigo"], topic("Perigo da célula"));
  add(
    ["Trunfos", "Trunfos e Distinções", "Distinções e requisitos"],
    topic("Trunfos, Distinções e criação"),
  );
  add(
    ["Aspecto", "Glamour permanente", "Glamour temporário"],
    first(
      topic("Glamour: Rêverie, Revelry e outras fontes"),
      topic("Temperamentos e Aspecto"),
    ),
  );
  add(
    ["Banalidade permanente", "Banalidade temporária"],
    topic("Banalidade e seus gatilhos"),
  );
  add(["Pesadelos"], topic("Pesadelos e Desencadear"));
  add(
    ["Kith", "Direitos Inatos", "Fraquezas", "Direitos Inatos e Fraquezas"],
    category("Kith", "lore"),
  );
  add(["Casa"], category("Casas", "lore"));
  add(["Corte", "Legado Seelie", "Legado Unseelie"], category("Legados"));
  add(
    ["Antítese", "Limiar de Inspiração / Extermínio"],
    first(category("Recursos e condições"), resources),
  );
  add(
    ["Afiliação", "Facção", "Essência"],
    topic("Afiliação, Facção e Essência"),
  );
  add(
    ["Natureza", "Comportamento"],
    first(
      topic("Natureza, Comportamento e Sombra"),
      category("Arquétipos · texto integral", "lore"),
      identity,
    ),
  );
  add(
    ["Outras características"],
    first(topic("Antecedentes e outras características"), identity),
  );
  add(["Paixões e intensidades"], topic("Paixões"));
  add(["Grilhões e níveis"], topic("Grilhões"));
  add(
    [
      "Arcanoi e níveis",
      "Arcanoi e recursos",
      "Aprendizado de Arcanoi",
      "Artes Comuns conhecidas",
      "Artes Iniciadas conhecidas e instrução",
    ],
    topic("Arcanoi"),
  );
  add(["Pathos"], topic("Pathos e Força de Vontade"));
  add(
    [
      "Sombra",
      "Sombra e história",
      "Identidade da Sombra",
      "Arquétipo da Sombra",
      "Sombra e condições",
      "Anotações da Sombra",
    ],
    first(topic("Criação da Sombra"), category("Sombra e Pesadelos")),
  );
  add(
    ["Angústia", "Angústia permanente", "Angústia temporária"],
    topic("Angústia permanente e temporária"),
  );
  add(["Espinhos e custos", "Espinhos e condições"], topic("Espinhos"));
  add(
    ["Equipamento"],
    first(
      topic("Equipamento de investigação e comunicação"),
      category("Variantes e referências"),
      identity,
    ),
  );
  for (const name of ["Talentos", "Perícias", "Conhecimentos"]) {
    add([name], first(category(`Habilidades — ${name}`), topic(name)));
  }
  add(
    ["Atributos"],
    first(
      category("Atributos"),
      category("Atributos e especialidades · texto integral"),
      topic("Criação: Atributos e Habilidades"),
      creation,
    ),
  );
  add(
    ["Habilidades"],
    first(
      topic("Habilidades e limites iniciais"),
      topic("Criação: Atributos e Habilidades"),
      topic("Atributos e habilidades"),
      creation,
    ),
  );
  add(
    ["Vitalidade e Força de Vontade", "Vitalidade, Força de Vontade e Aflição"],
    health,
  );
  const term = (name, context) =>
    first(
      aliases.get(normalizeReferenceTerm(name)),
      topic(name),
      category(name),
      context
        ? first(
            topic(context),
            category(context),
            aliases.get(normalizeReferenceTerm(context)),
          )
        : null,
    );
  const field = (definition, blockTitle, sectionTitle) => {
    const original = fieldGroups.get(definition.id);
    return first(
      term(definition.label),
      term(original),
      term(blockTitle),
      term(sectionTitle),
      identity,
    );
  };
  const heading = (title, context) =>
    first(term(title), term(context), creation, identity);
  const families = ordered
    .filter((a) => a.powerFamily || (a.power && a.power.level === null))
    .map((article) => ({
      article,
      names: [
        article.title.replace(/\s*\([^)]*\)/g, "").trim(),
        ...(article.title.match(/\(([^)]+)\)/)?.slice(1) || []),
      ],
    }));
  const inNotes = (definition, value) => {
    if (
      !value ||
      !/artes|disciplinas|arcanoi|trunfos|esferas-opcionais/.test(definition.id)
    )
      return [];
    const text = normalizeReferenceTerm(value);
    const found = new Map();
    for (const { article, names } of families) {
      if (
        names.some((name) => {
          const token = normalizeReferenceTerm(name);
          return (
            token.length >= 4 &&
            new RegExp(
              `(^|[^a-z])${token.replace(/ /g, "\\s+")}($|[^a-z])`,
            ).test(text)
          );
        })
      )
        found.set(article.id, {
          href: articleHref(system.id, article),
          title: article.title,
        });
    }
    return [...found.values()].slice(0, 8);
  };
  const blockReference = (title, fields, sectionTitle) =>
    first(
      term(title),
      term(fieldGroups.get(fields[0]?.id)),
      term(sectionTitle),
      creation,
      identity,
    );
  return { field, heading, inNotes, blockReference };
}
