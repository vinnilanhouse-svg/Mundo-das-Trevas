import React, { useEffect, useRef } from "react";

export function CemeteryAtmosphere() {
  const scene = useRef(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const paint = () => {
      // A bounded offset keeps long document pages inside the painted scenery.
      const depth = motion.matches ? 0 : Math.min(window.scrollY, 1600);
      scene.current?.style.setProperty("--cemetery-far", `${-depth * 0.025}px`);
      scene.current?.style.setProperty(
        "--cemetery-near",
        `${-depth * 0.075}px`,
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
    <div className="cemetery-atmosphere" ref={scene} aria-hidden="true">
      <div className="cemetery-distance" />
      <div className="cemetery-foreground" />
      <div className="cemetery-mist" />
      <div className="cemetery-shade" />
    </div>
  );
}
