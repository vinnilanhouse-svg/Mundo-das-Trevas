import React from "react";
import { documents } from "./document-data.js";

// Emphasis only: never infer a pool, a difficulty or an automatic activation.
export function RollText({ text }) {
  const terms =
    /((?:Força de Vontade|Força|Destreza|Vigor|Carisma|Manipulação|Aparência|Percepção|Inteligência|Raciocínio|Determinação|Autocontrole)\s*\+\s*[A-ZÀ-Ý][a-zà-ÿ]+(?:\s+(?:com|de|da|do)\s+[A-ZÀ-Ý][a-zà-ÿ]+)*|(?:dificuldade|Dif\.)\s*(?:de\s*)?[0-9]+(?:\s*\+\s*[0-9]+)?|Arete\/Iluminação|nenhum\s+teste|não\s+requer\s+qualquer\s+teste)/gi;
  return String(text)
    .split(terms)
    .map((part, index) =>
      index % 2 ? (
        <strong className="roll-emphasis" key={index}>
          {part}
        </strong>
      ) : (
        part
      ),
    );
}

export function searchableRules(power) {
  if (!power) return "";
  return [
    power.roll,
    power.cost,
    power.duration,
    power.requirements,
    power.rules,
    ...(power.rollNotes || []).map((note) => note.text),
  ]
    .filter(Boolean)
    .join(" ");
}

export function RollNotes({ power }) {
  if (!power.rollNotes?.length) return null;
  return (
    <section className="roll-notes" aria-label="Orientações para as rolagens">
      <h4>Como resolver os testes</h4>
      {power.rollNotes.map((note, index) => {
        const document = documents.find(
          (item) => item.sourceId === note.sourceId,
        );
        const page = note.pages.match(/\d+/)?.[0];
        return (
          <div className="roll-note" key={index}>
            <p>
              <RollText text={note.text} />
            </p>
            <small>
              {document && page ? (
                <a
                  href={`#/sistema/${document.system}/documentos/${document.sourceId}/${page}`}
                >
                  {note.source} →
                </a>
              ) : (
                note.source
              )}
            </small>
          </div>
        );
      })}
    </section>
  );
}
