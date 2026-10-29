import React from "react";
import { getSheetLayout } from "./sheet-layout.js";

function SheetField({
  field,
  value,
  onChange,
  compact,
  primary,
  hideLabel,
  systemId,
}) {
  const controlId = `sheet-field-${field.id}`;
  const numeric = field.kind === "rating" || field.kind === "number";
  const label =
    field.id.startsWith("temperamentos-reservas-") ||
    field.id.startsWith("angustia-")
      ? field.label.split(" ").at(-1)
      : field.label;
  const round =
    field.kind === "rating" ||
    field.id.endsWith("-permanente") ||
    ["trilhas-arete", "condicao-potencia-de-sangue"].includes(field.id) ||
    (systemId === "aparicao" &&
      ["trilhas-corpus", "trilhas-forca-de-vontade"].includes(field.id));
  const marks =
    numeric && field.max <= 50
      ? Math.min(field.max, 20, field.max === 50 ? 10 : field.max)
      : 0;
  const update = (event) => {
    const next = event.target.valueAsNumber;
    onChange(
      field.id,
      Number.isNaN(next)
        ? 0
        : Math.min(field.max, Math.max(0, Math.trunc(next))),
    );
  };
  return (
    <div
      className={`sheet-field sheet-field-${field.kind}${compact ? " sheet-field-compact" : ""}`}
    >
      <label
        htmlFor={controlId}
        className={hideLabel ? "sheet-visually-hidden" : undefined}
      >
        {label}
      </label>
      {numeric ? (
        <div className={`sheet-rating ${round ? "" : "sheet-rating-squares"}`}>
          {marks > 0 && (
            <span className="sheet-marks" aria-hidden="true">
              {Array.from({ length: marks }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  tabIndex={-1}
                  className={value > index ? "is-marked" : ""}
                  data-value={index + 1}
                  title={`Marcar ${index + 1}; clicar novamente para zerar`}
                  onClick={() =>
                    onChange(field.id, value === index + 1 ? 0 : index + 1)
                  }
                />
              ))}
            </span>
          )}
          <input
            id={controlId}
            aria-label={field.label}
            type="number"
            min={0}
            max={field.max}
            step={1}
            value={value}
            onChange={update}
          />
        </div>
      ) : field.kind === "notes" ? (
        <>
          <textarea
            id={controlId}
            rows={compact ? 2 : primary ? 3 : 6}
            maxLength={20000}
            value={value}
            onChange={(event) => onChange(field.id, event.target.value)}
          />
          <div className="sheet-print-notes" aria-hidden="true">
            {value || "\u00a0"}
          </div>
        </>
      ) : (
        <input
          id={controlId}
          maxLength={500}
          value={value}
          onChange={(event) => onChange(field.id, event.target.value)}
        />
      )}
    </div>
  );
}

export function SheetPages({ system, values, onChange }) {
  const layout = getSheetLayout(system);
  return (
    <div
      className={`sheet-pages sheet-pages-${system.id}`}
      style={{ "--sheet-accent": layout.accent }}
    >
      <p className="sheet-mark-help">
        Clique nos círculos e quadrados ou digite o valor ao lado. As marcas
        mostram o valor registrado; dano e condições ficam nos campos próprios.
      </p>
      {layout.pages.map((page, index) => (
        <section
          key={page.title}
          className="sheet-paper"
          aria-label={`Folha ${index + 1}: ${page.title}`}
        >
          <header className="sheet-paper-header">
            <span>FICHA DE PERSONAGEM · {system.editionLabel}</span>
            <h3>{system.name}</h3>
            <p>
              {system.subtitle} <span>·</span> {page.title}
            </p>
          </header>
          {page.sections.map((section) => (
            <section
              key={section.title}
              className="sheet-section"
              aria-label={section.title}
            >
              <h4>{section.title}</h4>
              <div
                className="sheet-section-columns"
                style={{
                  "--sheet-template": section.weights
                    ? section.weights.map((weight) => `${weight}fr`).join(" ")
                    : `repeat(${section.columns.length}, minmax(0, 1fr))`,
                }}
              >
                {section.columns.map((column, col) => (
                  <div className="sheet-column" key={col}>
                    {column.map((block, i) => (
                      <fieldset
                        key={`${block.title}-${i}`}
                        className={`sheet-group${block.compact ? " sheet-block-compact" : ""}`}
                      >
                        {block.title && <legend>{block.title}</legend>}
                        {block.fields.map((field) => (
                          <SheetField
                            key={field.id}
                            field={field}
                            value={values[field.id]}
                            onChange={onChange}
                            compact={block.compact}
                            primary={index === 0}
                            hideLabel={
                              Boolean(block.title) && block.fields.length === 1
                            }
                            systemId={system.id}
                          />
                        ))}
                      </fieldset>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ))}
          <footer className="sheet-paper-footer">
            <span>
              {system.name} {system.editionLabel} · {page.title}
            </span>
            <span>
              Folha {index + 1} de {layout.pages.length}
            </span>
          </footer>
        </section>
      ))}
    </div>
  );
}
