import { analyticsAllowed } from "./privacy.js";

// SDK loading and every outgoing page view require an active decision.
export async function startAnalytics({ routes, getChoice, isActive }) {
  if (!isActive() || !analyticsAllowed(getChoice())) return () => {};
  const { inject, pageview } = await import("@vercel/analytics");
  if (!isActive() || !analyticsAllowed(getChoice())) return () => {};
  let stopped = false;
  let lastPath = null;
  const allowed = () => !stopped && isActive() && analyticsAllowed(getChoice());
  inject({
    mode: "production",
    debug: false,
    framework: "react",
    disableAutoTrack: true,
    beforeSend: (event) =>
      allowed() ? routes.cleanEvent(event, location.origin) : null,
  });
  const onRoute = () => {
    if (!allowed()) return;
    const path = routes.pathFor(location.hash);
    if (!path || path === lastPath) return;
    lastPath = path;
    pageview({ path, route: path });
  };
  window.addEventListener("hashchange", onRoute);
  onRoute();
  return () => {
    stopped = true;
    window.removeEventListener("hashchange", onRoute);
    // Discard pending views if the script has not loaded yet.
    if (window.vaq)
      window.vaq = window.vaq.filter(([name]) => name !== "pageview");
  };
}
