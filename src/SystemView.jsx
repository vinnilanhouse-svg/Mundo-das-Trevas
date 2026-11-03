import React, { Component, lazy, Suspense, useEffect, useState } from "react";
import { loadSystem } from "./archive-data.js";

const SystemLibrary = lazy(() =>
  import("./Library.jsx").then((module) => ({ default: module.SystemLibrary })),
);
class LibraryBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="empty-state" role="alert">
        <h1>Não foi possível abrir o sistema</h1>
        <p>Confira sua conexão e atualize a página.</p>
        <button className="button" onClick={() => location.reload()}>
          Tentar novamente
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export function SystemView({ system, ...props }) {
  const [state, setState] = useState({});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ loading: true });
    loadSystem(system.id).then(
      (data) => active && setState({ data }),
      (error) => active && setState({ error: error.message }),
    );
    return () => {
      active = false;
    };
  }, [system.id, attempt]);
  if (state.error)
    return (
      <div className="empty-state" role="alert">
        <h1>Não foi possível abrir {system.name}</h1>
        <p>{state.error}</p>
        <button
          className="button"
          onClick={() => setAttempt((value) => value + 1)}
        >
          Tentar novamente
        </button>
      </div>
    );
  if (!state.data)
    return (
      <p className="archive-loading" role="status">
        Abrindo {system.name} {system.editionLabel}…
      </p>
    );
  return (
    <LibraryBoundary>
      <Suspense
        fallback={
          <p className="archive-loading" role="status">
            Abrindo o sistema…
          </p>
        }
      >
        <SystemLibrary system={state.data} {...props} />
      </Suspense>
    </LibraryBoundary>
  );
}
