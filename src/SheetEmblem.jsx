import React from "react";

// Original ornaments, decorative only: they never cover or replace a field.
export function SheetEmblem({ systemId }) {
  const symbols = {
    vampiro: (
      <>
        <path d="M15 64V37c0-17 25-29 25-29s25 12 25 29v27M23 64V38c0-10 17-21 17-21s17 11 17 21v26M13 64h54M40 25v24" />
        <path d="M40 40s-9 11-9 17a9 9 0 0 0 18 0c0-6-9-17-9-17Z" />
      </>
    ),
    changeling: (
      <>
        <path d="M40 64V26M40 38C7 42 10 10 30 22l10 16c33 4 30-28 10-16ZM40 40C16 35 14 64 31 56l9-16c24-5 26 24 9 16ZM20 67c-9-8-11-24-5-35M60 67c9-8 11-24 5-35M33 13l7 6 7-6" />
        <circle cx="17" cy="24" r="3" />
        <circle cx="63" cy="24" r="3" />
      </>
    ),
    cacador: (
      <>
        <path d="M18 11H9v11M62 11h9v11M9 58v11h9M62 69h9V58M40 5v20M40 55v20M5 40h20M55 40h20M31 40h18M40 31v18" />
        <circle cx="40" cy="40" r="24" />
        <circle cx="40" cy="40" r="17" />
      </>
    ),
    mago: (
      <>
        <circle cx="40" cy="40" r="31" />
        <circle cx="40" cy="40" r="24" />
        <path d="m40 13 23 40H17Zm0 54L17 27h46ZM40 2v8M40 70v8M2 40h8M70 40h8" />
        <circle cx="40" cy="40" r="6" />
      </>
    ),
    aparicao: (
      <>
        <path d="M17 69V37C17 20 40 8 40 8s23 12 23 29v32M24 69V38c0-11 16-22 16-22s16 11 16 22v31M12 69h56M40 26v32M28 39h24M29 63h22" />
        <path d="M8 53c4 0 5 4 9 4M63 57c4 0 5-4 9-4" />
      </>
    ),
  };
  return (
    <svg
      className="sheet-emblem"
      viewBox="0 0 80 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {symbols[systemId]}
    </svg>
  );
}
