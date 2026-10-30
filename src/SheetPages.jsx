import React, { useMemo } from "react";
import { getSheetLayout } from "./sheet-layout.js";
import { createSheetReferences } from "./sheet-references.js";
import { SheetEmblem } from "./SheetEmblem.jsx";
import { SheetGlyph, SheetAstralScale } from "./SheetGlyph.jsx";

function blockClassName(systemId, block) {
  const classes = ["sheet-group"];
  if (block.compact) classes.push("sheet-block-compact");
  if (
    systemId === "vampiro" &&
    block.fields.some((f) =>
      ["sangue-fome", "condicao-humanidade"].includes(f.id),
    )
  )
    classes.push("sheet-cathedral-resource");
  if (
    systemId === "mago" &&
    block.fields.some((f) => f.id === "recursos-magicos-quintessencia")
  )
    classes.push("sheet-astral-resources");
  return classes.join(" ");
}

function ReferenceLink({ reference, children }) {
  if (!reference) return children;
  return (
    <a
      className="sheet-reference-link"
      href={reference.href}
      title={`Consultar: ${reference.title}`}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
      <svg
        aria-hidden="true"
        width="10"
        height="10"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
      >
        <path d="M3 9 9 3M3 3h6v6" />
      </svg>
    </a>
  );
}

function SheetField({
  field,
  value,
  onChange,
  compact,
  primary,
  hideLabel,
  systemId,
  reference,
  noteLinks,
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
      data-field-id={field.id}
    >
      <label
        htmlFor={controlId}
        className={hideLabel ? "sheet-visually-hidden" : undefined}
      >
        {systemId === "mago" && field.id.startsWith("esferas-") && (
          <SheetGlyph name={label} />
        )}
        {hideLabel ? (
          label
        ) : (
          <ReferenceLink reference={reference}>{label}</ReferenceLink>
        )}
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
                  style={{ "--mark-index": index }}
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
          {noteLinks.length > 0 && (
            <div
              className="sheet-reference-chips"
              aria-label="Referências citadas neste campo"
            >
              {noteLinks.map((link) => (
                <ReferenceLink key={link.href} reference={link}>
                  {link.title}
                </ReferenceLink>
              ))}
            </div>
          )}
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
  const illustrated = system.id !== "changeling";
  const references = useMemo(() => createSheetReferences(system), [system]);
  return (
    <div
      className={`sheet-pages sheet-pages-${system.id}${illustrated ? " sheet-illustrated" : ""}`}
      style={{ "--sheet-accent": layout.accent }}
    >
      <p className="sheet-mark-help">
        Clique nos círculos e quadrados ou digite o valor ao lado. As marcas
        mostram o valor registrado; dano e condições ficam nos campos próprios.{" "}
        Os nomes e títulos com seta abrem as explicações no acervo.
      </p>
      {layout.pages.map((page, index) => (
        <section
          key={page.title}
          className="sheet-paper"
          aria-label={`Folha ${index + 1}: ${page.title}`}
        >
          {illustrated && (
            <div className="sheet-art-border" aria-hidden="true" />
          )}
          <header className="sheet-paper-header">
            <div className="sheet-header-scene" aria-hidden="true" />
            <SheetEmblem systemId={system.id} />
            <span className="sheet-folio" aria-hidden="true">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(layout.pages.length).padStart(2, "0")}
            </span>
            <span>FICHA DE PERSONAGEM · {system.editionLabel}</span>
            <h3>
              <span className="sheet-title-name">{system.name}</span>
              <small className="sheet-title-edition">
                {system.editionLabel}
              </small>
            </h3>
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
              <h4>
                {illustrated && (
                  <SheetGlyph name={section.title} systemId={system.id} />
                )}
                <ReferenceLink reference={references.heading(section.title)}>
                  {section.title}
                </ReferenceLink>
              </h4>
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
                        className={blockClassName(system.id, block)}
                      >
                        {block.title && (
                          <legend>
                            {illustrated && (
                              <SheetGlyph
                                name={block.title}
                                systemId={system.id}
                              />
                            )}
                            <ReferenceLink
                              reference={references.blockReference(
                                block.title,
                                block.fields,
                                section.title,
                              )}
                            >
                              {block.title}
                            </ReferenceLink>
                          </legend>
                        )}
                        {illustrated &&
                          system.id === "mago" &&
                          block.fields.some(
                            (f) => f.id === "recursos-magicos-quintessencia",
                          ) && <SheetAstralScale />}
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
                            reference={references.field(
                              field,
                              block.title,
                              section.title,
                            )}
                            noteLinks={
                              field.kind === "notes"
                                ? references.inNotes(field, values[field.id])
                                : []
                            }
                          />
                        ))}
                      </fieldset>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ))}
          {illustrated && (
            <div className="sheet-art-ending" aria-hidden="true">
              <SheetGlyph
                name={system.id === "aparicao" ? "Grilhões" : "Esferas"}
              />
            </div>
          )}
          {system.id === "changeling" && (
            <div className="sheet-stained-footer" aria-hidden="true" />
          )}
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
