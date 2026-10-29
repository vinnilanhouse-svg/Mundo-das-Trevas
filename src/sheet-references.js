import documents from "./documents.json" with { type: "json" };
import { articleHref, groupHref } from "./library-routes.js";
import {
  sheetReferencePolicy,
  topicTarget,
  groupTarget,
} from "./sheet-reference-policy.js";

export const normalizeReferenceTerm = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function createSheetReferences(system) {
  const policy = sheetReferencePolicy[system.id];
  const ordered = system.sections;
  const topics = new Map();
  const groups = new Set();
  for (const article of system.sections) {
    const key = `${article.category}:${normalizeReferenceTerm(article.title)}`;
    if (!topics.has(key)) topics.set(key, []);
    topics.get(key).push(article);
    groups.add(`${article.category}:${article.group}`);
  }
  const fieldGroups = new Map(
    system.sheet.groups.flatMap((group) =>
      group.fields.map((field) => [field.id, group]),
    ),
  );
  const resolve = (target) => {
    if (!target) return null;
    if (target.type === "article") {
      const candidates =
        topics.get(
          `${target.category}:${normalizeReferenceTerm(target.title)}`,
        ) || [];
      const matches = target.group
        ? candidates.filter((article) => article.group === target.group)
        : candidates;
      if (matches.length !== 1) return null;
      const article = matches[0];
      return {
        href: articleHref(system.id, article),
        title: article.title,
        kind: "article",
        id: article.id,
      };
    }
    if (target.type === "group") {
      if (!groups.has(`${target.category}:${target.group}`)) return null;
      return {
        href: groupHref(system.id, target.category, target.group),
        title: target.group,
        kind: "group",
        group: target.group,
        category: target.category,
      };
    }
    if (target.type === "document") {
      const document = documents.find(
        (d) => d.sourceId === target.sourceId && d.system === system.id,
      );
      if (
        !document ||
        !Number.isInteger(target.page) ||
        target.page < 1 ||
        target.page > document.pages
      )
        return null;
      return {
        href: `#/sistema/${system.id}/documentos/${target.sourceId}/${target.page}`,
        title: target.title,
        kind: "document",
        sourceId: target.sourceId,
        page: target.page,
      };
    }
    return null;
  };
  const attributeGroup = (group) => {
    if (system.id === "changeling")
      return resolve({
        type: "document",
        sourceId: "c20-core",
        page: group === "Atributos físicos" ? 160 : 161,
        title: `${group} — C20`,
      });
    return resolve(
      system.id === "cacador" ? groupTarget(group) : topicTarget(group),
    );
  };
  const skillDomain = (group) =>
    group.startsWith("Habilidades ") ? group : `Habilidades — ${group}`;
  const skillGroup = (group) =>
    system.id === "mago"
      ? resolve(groupTarget(`${group} · texto integral`))
      : resolve(groupTarget(skillDomain(group)));
  const field = (definition) => {
    const group = fieldGroups.get(definition.id);
    // Unmapped or newly introduced fields never inherit an unrelated destination.
    if (!group || !policy) return null;
    if (Object.hasOwn(policy.fields, definition.id))
      return resolve(policy.fields[definition.id]);
    if (group.title === "Esferas" || group.title === "Alçadas")
      return resolve(topicTarget(definition.label, "mechanics", group.title));
    if (group.title.startsWith("Atributos "))
      return system.id === "cacador"
        ? resolve(topicTarget(definition.label, "mechanics", group.title))
        : attributeGroup(group.title);
    if (
      ["Talentos", "Perícias", "Conhecimentos"].includes(group.title) ||
      group.title.startsWith("Habilidades ")
    ) {
      if (system.id === "mago") return skillGroup(group.title);
      return (
        resolve(
          topicTarget(definition.label, "mechanics", skillDomain(group.title)),
        ) || skillGroup(group.title)
      );
    }
    return resolve(policy.groups[group.title]);
  };
  const heading = (title) =>
    resolve(
      policy && Object.hasOwn(policy.headings, title)
        ? policy.headings[title]
        : policy?.groups[title],
    );
  const blockReference = (title, fields) => {
    if (!fields.length) return null;
    if (fields.length === 1) return field(fields[0]);
    const groups = [
      ...new Set(fields.map((f) => fieldGroups.get(f.id)?.title)),
    ];
    if (groups.length !== 1) return null;
    const original = groups[0];
    if (original?.startsWith("Atributos ")) return attributeGroup(original);
    if (
      ["Talentos", "Perícias", "Conhecimentos"].includes(original) ||
      original?.startsWith("Habilidades ")
    )
      return skillGroup(original);
    if (["Esferas", "Alçadas"].includes(original))
      return resolve(groupTarget(original));
    const references = fields.map(field);
    if (references.every((ref) => ref && ref.href === references[0]?.href))
      return references[0];
    return null;
  };
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
  return { field, heading, inNotes, blockReference };
}
