import React, { useEffect, useRef } from "react";

export function ForestAtmosphere() {
  const scene = useRef(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      const depth = motion.matches ? 0 : Math.min(window.scrollY, 1600);
      scene.current?.style.setProperty("--forest-far", `${-depth * 0.025}px`);
      scene.current?.style.setProperty("--forest-near", `${-depth * 0.075}px`);
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
    <div className="forest-atmosphere" ref={scene} aria-hidden="true">
      <div className="forest-distance" />
      <div className="forest-foreground" />
      <div className="forest-light" />
      <div className="forest-petals">
        {Array.from({ length: 6 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
    </div>
  );
}
