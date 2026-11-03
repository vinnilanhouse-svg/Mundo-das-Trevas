import React from "react";
export function SystemLabel({ system }) {
  return (
    <>
      {system.name}{" "}
      <small className="edition-badge">{system.editionLabel}</small>
    </>
  );
}
