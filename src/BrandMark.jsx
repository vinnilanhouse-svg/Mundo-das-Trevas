import React from "react";

// The nearby site/company name supplies the accessible label.
export function BrandMark({ className = "" }) {
  return (
    <img
      className={`elemental-mark ${className}`.trim()}
      src="/images/brand/elemental-corp.webp"
      width="64"
      height="64"
      alt=""
      decoding="async"
    />
  );
}
