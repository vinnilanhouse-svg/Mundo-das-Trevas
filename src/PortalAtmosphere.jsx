import React, { useEffect, useRef } from "react";

// A single restrained landscape layer avoids moving the content while reading.
export function PortalAtmosphere({ systemId }) {
  const scene = useRef(null);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      scene.current?.style.setProperty(
        "--portal-depth",
        `${motion.matches ? 0 : -Math.min(window.scrollY, 1600) * 0.035}px`,
      );
      frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const configure = () => {
      window.removeEventListener("scroll", schedule);
      if (!motion.matches)
        window.addEventListener("scroll", schedule, { passive: true });
      schedule();
    };
    configure();
    motion.addEventListener("change", configure);
    return () => {
      window.removeEventListener("scroll", schedule);
      motion.removeEventListener("change", configure);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div
      className={`portal-atmosphere ${systemId ? "portal-atmosphere-system" : "portal-atmosphere-home"}`}
      aria-hidden="true"
      ref={scene}
    >
      <div
        className="portal-landscape"
        style={{
          backgroundImage: `url(/images/portals/${systemId || "vampiro"}.webp)`,
        }}
      />
      <div className="portal-landscape-shade" />
    </div>
  );
}
