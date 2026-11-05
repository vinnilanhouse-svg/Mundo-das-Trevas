import React from "react";
import "./experience-costs.css";

// Reference values supplied for each edition; no character values are changed.
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
  vampiro: [
    ["Aumento de Atributo", 5, "new"],
    ["Aumento de Habilidade", 3, "new"],
    ["Nova Especialização", 3, "fixed"],
    ["Disciplina de Clã", 5, "new"],
    ["Outra Disciplina", 7, "new"],
    ["Disciplina Caitiff", 6, "new"],
    ["Ritual de Feitiçaria de Sangue", 3, "ritual"],
    ["Fórmula Sangue-Ralo", 3, "formula"],
    ["Vantagem", 3, "per-point"],
    ["Potência do Sangue", 10, "new"],
  ],
  cacador: [
    ["Aumento em Atributo", 5, "new"],
    ["Aumento em Habilidade", 3, "new"],
    ["Especialização", 3, "fixed"],
    ["Trunfo", 6, "fixed"],
    ["Distinção", 3, "fixed"],
    ["Vantagem", 3, "per-point"],
  ],
  aparicao: [
    ["Atributo", 4],
    ["Nova Habilidade", 3, "fixed"],
    ["Habilidade", 2],
    ["Novo Arcanos", 7, "fixed"],
    ["Arcanos", 3],
    ["Força de Vontade", 1, "current"],
    ["Paixões, Grilhões e Antecedentes", null, "special"],
  ],
};

function ExperienceIntroduction({ systemId }) {
  if (systemId === "vampiro")
    return (
      <>
        Nos aumentos indicados, multiplique o <strong>novo nível</strong> pelo
        fator. Rituais e fórmulas usam seus próprios níveis.
      </>
    );
  if (systemId === "cacador")
    return (
      <>
        Atributos e Habilidades usam o <strong>novo nível</strong>.
        Especializações, Trunfos e Distinções têm custo fixo.
      </>
    );
  if (systemId === "aparicao")
    return (
      <>
        Os aumentos usam o <strong>nível atual</strong>. Novas Habilidades e
        Arcanoi têm custo fixo.
      </>
    );
  return (
    <>
      Novos traços têm custo fixo. Para os demais, multiplique o{" "}
      <strong>valor atual</strong> pelo fator indicado.
    </>
  );
}

function ExperienceValue({ amount, kind, currentLabel }) {
  if (kind === "fixed")
    return (
      <span className="experience-costs-fixed">
        {amount} <small>XP</small>
      </span>
    );
  if (kind === "special")
    return (
      <span className="experience-costs-fixed experience-costs-special">
        Especial*
      </span>
    );
  if (kind === "current")
    return <span className="experience-costs-label">{currentLabel}</span>;
  if (kind === "per-point")
    return (
      <span className="experience-costs-multiplier">
        <strong>{amount} XP</strong>
        <span>por ponto</span>
      </span>
    );
  const basis =
    {
      new: "Novo nível",
      ritual: "Nível do ritual",
      formula: "Nível da fórmula",
    }[kind] || currentLabel;
  return (
    <span className="experience-costs-multiplier">
      <span>{basis}</span>
      <strong>× {amount}</strong>
    </span>
  );
}

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
          <ExperienceIntroduction systemId={system.id} />
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
                  <ExperienceValue
                    amount={amount}
                    kind={kind}
                    currentLabel={
                      system.id === "aparicao" ? "Nível atual" : "Valor atual"
                    }
                  />
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
        {system.id === "aparicao" && (
          <p className="experience-costs-note">
            * Requer permissão do Narrador. Consulte as condições específicas de
            evolução de Paixões, Grilhões e Antecedentes.
          </p>
        )}
      </div>
    </details>
  );
}
