import React, { useEffect, useRef, useState } from "react";
import { BrandMark } from "./BrandMark.jsx";

export const CONTACT_EMAIL = "coradi.maddaloni@gmail.com";
const WELCOME_KEY = "arquivo-trevas-welcome-v1";

function shouldWelcome() {
  try {
    return localStorage.getItem(WELCOME_KEY) !== "1";
  } catch {
    return true;
  }
}

export function WelcomeNotice({ paused = false }) {
  const [visible, setVisible] = useState(shouldWelcome);
  const dialog = useRef(null);

  useEffect(() => {
    if (!visible || paused) return;
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    element.querySelector("[data-welcome-primary]")?.focus();
    document.body.style.overflow = "hidden";
    try {
      localStorage.setItem(WELCOME_KEY, "1");
    } catch {
      // The notice still works when browser storage is unavailable.
    }
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [visible, paused]);

  if (!visible || paused) return null;
  const dismiss = () => setVisible(false);
  return (
    <dialog
      className="welcome-dialog"
      ref={dialog}
      aria-labelledby="welcome-title"
      aria-describedby="welcome-description"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onClose={() => {
        // Ignore a queued close event from Strict Mode's effect cleanup.
        if (!dialog.current?.open) dismiss();
      }}
    >
      <button
        className="welcome-close"
        aria-label="Fechar aviso de boas-vindas"
        onClick={dismiss}
      >
        <span aria-hidden="true">×</span>
      </button>
      <span className="welcome-emblem" aria-hidden="true">
        <BrandMark />
      </span>
      <div className="eyebrow">DE FÃ PARA FÃ</div>
      <h2 id="welcome-title">Bem-vindo ao Arquivo das Trevas</h2>
      <div id="welcome-description">
        <p>
          Este é um acervo independente, feito de fã para fã, para pesquisar,
          consultar e explorar os sistemas do Mundo das Trevas.
        </p>
        <p>
          Encontrou algum problema, tem uma dica ou uma ideia para melhorar o
          site? Vou adorar ouvir você! É só entrar em contato pela aba{" "}
          <strong>Contato</strong>.
        </p>
        <p>
          Sua contribuição ajuda este acervo a crescer. Boas pesquisas e boas
          histórias!
        </p>
      </div>
      <div className="welcome-actions">
        <button
          className="button button-primary"
          data-welcome-primary
          onClick={dismiss}
        >
          Começar a explorar
        </button>
        <a className="welcome-contact" href="#/contato" onClick={dismiss}>
          Falar sobre o projeto →
        </a>
      </div>
    </dialog>
  );
}

export function ContactPage({ onBack }) {
  return (
    <section
      className="about-page contact-page"
      aria-labelledby="contact-title"
    >
      <a className="back-link" href="#" onClick={onBack}>
        ← Voltar ao acervo
      </a>
      <div className="eyebrow">DE FÃ PARA FÃ</div>
      <h1 id="contact-title">Entre em contato</h1>
      <p>
        Encontrou um problema, tem uma dica ou uma ideia? Vou adorar receber sua
        mensagem e conversar sobre como melhorar o Arquivo das Trevas.
      </p>
      <div className="contact-card">
        <span className="eyebrow">ESCREVA PARA</span>
        <a className="contact-email" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        <p>
          Use este e-mail para compartilhar sugestões, apontar erros ou contar o
          que gostaria de encontrar no acervo.
        </p>
        <a className="button button-primary" href={`mailto:${CONTACT_EMAIL}`}>
          Enviar e-mail ↗
        </a>
      </div>
      <p>Este projeto é feito de fã para fã. Sua contribuição é bem-vinda!</p>
    </section>
  );
}
