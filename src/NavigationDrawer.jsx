import React, { useEffect, useRef } from "react";

export function NavigationDrawer({ open, onClose, triggerRef, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    const mobile = window.matchMedia("(max-width: 950px)");
    element.showModal();
    element.querySelector(".drawer-close")?.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
    const resize = () => {
      if (!mobile.matches) onClose();
    };
    mobile.addEventListener("change", resize);
    return () => {
      mobile.removeEventListener("change", resize);
      element.close();
      document.body.style.overflow = previousOverflow;
      const trigger = triggerRef.current;
      const target = trigger?.getClientRects().length
        ? trigger
        : document.querySelector(".portal-navigation button");
      target?.focus({ preventScroll: true });
    };
  }, [open, onClose, triggerRef]);
  return (
    <dialog
      ref={dialog}
      id="site-navigation"
      className={`sidebar ${open ? "is-open" : ""}`}
      aria-label="Menu de navegação"
      aria-modal="true"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const nodes = [
          ...event.currentTarget.querySelectorAll(
            "a[href],button,input,select,textarea,summary,[tabindex]",
          ),
        ].filter(
          (node) =>
            !node.disabled &&
            node.tabIndex >= 0 &&
            node.getClientRects().length,
        );
        const first = nodes[0],
          last = nodes.at(-1);
        if (!first) {
          event.preventDefault();
          return;
        }
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            !nodes.includes(document.activeElement))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !nodes.includes(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (!dialog.current?.open) onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      {children}
    </dialog>
  );
}
