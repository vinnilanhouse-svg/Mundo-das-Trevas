import React from "react";
import { RollText, RollNotes } from "./rolls.jsx";
import { powerFacts } from "./power-summary.js";

export function PowerQuickFacts({ power }) {
  return (
    <dl className="power-quick-facts">
      {powerFacts(power)
        .filter((fact) => fact.id !== "resistance")
        .map((fact) => (
          <div key={fact.id}>
            <dt>{fact.label}</dt>
            <dd>
              <RollText text={fact.text} />
            </dd>
          </div>
        ))}
    </dl>
  );
}
export function PowerDetails({ power }) {
  const rows = powerFacts(power);
  if (power.requirements)
    rows.push({
      id: "requirements",
      label: "Requisitos / amálgama",
      text: power.requirements,
    });
  return (
    <section
      className="power-details power-reference-card"
      aria-label="Como usar este poder"
    >
      <div className="power-card-heading">
        <h3>Consulta rápida</h3>
        <div>
          <span>{power.family}</span>
          <span>
            {power.level == null
              ? "Sem escala numérica"
              : `Nível ${power.level}`}
          </span>
          {power.branch && <span>{power.branch}</span>}
        </div>
      </div>
      <div className="power-effect">
        <h4>Efeito</h4>
        <div className="article-body">
          <RollText
            text={power.effect || "Consulte a descrição deste poder."}
          />
        </div>
      </div>
      <dl className="power-facts">
        {rows.map((fact) => (
          <div key={fact.id} data-power-fact={fact.id}>
            <dt>{fact.label}</dt>
            <dd>
              <RollText text={fact.text} />
              {fact.quoted && (
                <small className="power-extract-label">
                  Trecho da resolução; consulte o contexto completo abaixo.
                </small>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <RollNotes power={power} />
      {power.rules && (
        <details className="power-rules" open>
          <summary>Resolução completa: testes, condições e resultados</summary>
          <div className="article-body">
            <RollText text={power.rules} />
          </div>
        </details>
      )}
      {power.referenceNote && (
        <p className="power-note">{power.referenceNote}</p>
      )}
      <p className="power-citation">Referência do efeito: {power.source}</p>
    </section>
  );
}
