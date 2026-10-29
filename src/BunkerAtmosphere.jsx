import React, { useEffect, useRef } from "react";

export function BunkerAtmosphere() {
  const scene = useRef(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      const depth = motion.matches ? 0 : Math.min(window.scrollY, 1600);
      scene.current?.style.setProperty("--bunker-far", `${-depth * 0.025}px`);
      scene.current?.style.setProperty("--bunker-near", `${-depth * 0.075}px`);
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
    <div className="bunker-atmosphere" ref={scene} aria-hidden="true">
      <div className="bunker-distance" />
      <div className="bunker-foreground" />
      <div className="bunker-light" />
      <div className="bunker-shade" />
    </div>
  );
}
