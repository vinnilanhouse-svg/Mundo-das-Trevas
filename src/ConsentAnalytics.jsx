import React, { useCallback, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { analyticsAllowed } from "./privacy.js";
import { createAnalyticsRoutes } from "./analytics-routes.js";
import catalog from "./generated/catalog.json";
import publishedHashes from "./generated/analytics-routes.json";
import { documents } from "./document-data.js";

const routes = createAnalyticsRoutes(catalog, documents, publishedHashes);

export default function ConsentAnalytics({ choiceRef }) {
  const [path, setPath] = useState(() => routes.pathFor(location.hash));
  const beforeSend = useCallback(
    (event) =>
      analyticsAllowed(choiceRef.current)
        ? routes.cleanEvent(event, location.origin)
        : null,
    [routes, choiceRef],
  );

  useEffect(() => {
    const onRoute = () => setPath(routes.pathFor(location.hash));
    window.addEventListener("hashchange", onRoute);
    return () => {
      window.removeEventListener("hashchange", onRoute);
      if (window.vaq)
        window.vaq = window.vaq.filter(([name]) => name !== "pageview");
    };
  }, [routes]);

  // The explicit route prop disables automatic URL tracking. Only known hash
  // routes become page views; query strings and private fields stay out.
  return (
    <Analytics
      mode="production"
      debug={false}
      route={path}
      path={path}
      beforeSend={beforeSend}
    />
  );
}
