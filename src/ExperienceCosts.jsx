import React from "react";
import "./experience-costs.css";

// Reference values supplied for these two editions; no character values are changed.
const tables = {
  mago: [
    ["Nova Habilidade", 3, "fixed"],
    ["Nova Esfera", 10, "fixed"],
    ["Esferas de Afinidade", 7],
    ["Outras Esferas", 8],
    ["Arete", 8],
    ["Atributo", 4],
    ["Habilidade", 2],
    ["Antecedentes*", 3],
    ["Força de Vontade", 1],
  ],
  changeling: [
    ["Atributo", 4],
    ["Habilidade", 2],
    ["Nova Habilidade", 3, "fixed"],
    ["Arte", 4],
    ["Nova Arte", 7, "fixed"],
    ["Reino (Alçada)", 3],
    ["Novo Reino (Alçada)", 5, "fixed"],
    ["Força de Vontade", 2],
    ["Glamour", 3],
  ],
};

export function ExperienceCosts({ system }) {
  const rows = tables[system.id];
  if (!rows) return null;
  const titleId = `experience-costs-${system.id}`;
  return (
    <details className={`experience-costs experience-costs-${system.id}`} open>
      <summary aria-labelledby={titleId}>
        <span className="experience-costs-seal" aria-hidden="true">
          XP
        </span>
        <span className="experience-costs-heading">
          <span className="experience-costs-eyebrow">
            EVOLUÇÃO DA PERSONAGEM · {system.editionLabel}
          </span>
          <strong id={titleId}>Custos de experiência</strong>
        </span>
        <span className="experience-costs-chevron" aria-hidden="true">
          ⌄
        </span>
      </summary>
      <div className="experience-costs-content">
        <p className="experience-costs-intro">
          Novos traços têm custo fixo. Para os demais, multiplique o{" "}
          <strong>valor atual</strong> pelo fator indicado.
        </p>
        <table>
          <caption>
            Custo em XP — {system.name} {system.editionLabel}
          </caption>
          <thead>
            <tr>
              <th scope="col">
                {system.id === "mago" ? "Traço" : "Característica"}
              </th>
              <th scope="col">Custo em XP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, amount, kind]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>
                  {kind === "fixed" ? (
                    <span className="experience-costs-fixed">
                      {amount} <small>XP</small>
                    </span>
                  ) : (
                    <span className="experience-costs-multiplier">
                      <span>Valor atual</span>
                      <strong>× {amount}</strong>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {system.id === "mago" && (
          <p className="experience-costs-note">
            * A referência enviada não inclui a observação dos Antecedentes.
          </p>
        )}
      </div>
    </details>
  );
}
