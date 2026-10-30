import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CONTACT_EMAIL } from "./Community.jsx";
import { documents } from "./document-data.js";
import {
  CONSENT_KEY,
  PRIVACY_CONTROLLER,
  PRIVACY_UPDATED,
  analyticsAllowed,
  createPrivacyChoice,
  readPrivacyChoice,
  storePrivacyChoice,
  validPrivacyChoice,
} from "./privacy.js";
import { createAnalyticsRoutes } from "./analytics-routes.js";

const PrivacyContext = createContext(null);
const initialChoice = () => {
  try {
    return readPrivacyChoice(window.localStorage);
  } catch {
    return null;
  }
};

export function PrivacyProvider({ systems, children }) {
  const [choice, setChoice] = useState(initialChoice);
  const current = useRef(choice);
  const trackingPermitted = analyticsAllowed(choice);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saved, setSaved] = useState("");
  const routes = useMemo(
    () => createAnalyticsRoutes(systems, documents),
    [systems],
  );

  useEffect(() => {
    let timer;
    const refresh = (event) => {
      if (
        event?.type === "storage" &&
        event.key !== null &&
        event.key !== CONSENT_KEY
      )
        return;
      if (event?.type === "visibilitychange" && document.hidden) return;
      const next =
        event?.type === "storage"
          ? initialChoice()
          : validPrivacyChoice(current.current)
            ? current.current
            : null;
      const withdrawing =
        current.current?.analytics === true && !analyticsAllowed(next);
      current.current = next;
      setChoice(next);
      if (withdrawing && import.meta.env.PROD) window.location.reload();
    };
    window.addEventListener("storage", refresh);
    document.addEventListener("visibilitychange", refresh);
    const schedule = () => {
      if (!current.current) return;
      timer = setTimeout(
        () => {
          refresh();
          schedule();
        },
        Math.min(
          Math.max(1, current.current.expiresAt - Date.now() + 1),
          2147483647,
        ),
      );
    };
    schedule();
    return () => {
      window.removeEventListener("storage", refresh);
      document.removeEventListener("visibilitychange", refresh);
      if (timer) clearTimeout(timer);
    };
  }, [choice]);

  useEffect(() => {
    if (!import.meta.env.PROD || !trackingPermitted) return;
    let active = true;
    let stop;
    import("./analytics-runtime.js")
      .then(({ startAnalytics }) =>
        startAnalytics({
          routes,
          getChoice: () => current.current,
          isActive: () => active,
        }),
      )
      .then((cleanup) => {
        if (active) stop = cleanup;
        else cleanup();
      })
      .catch(() => {
        // Blocking metrics or a temporary SDK failure never blocks the archive.
      });
    return () => {
      active = false;
      stop?.();
    };
  }, [trackingPermitted, routes]);

  const saveChoice = (analytics) => {
    const withdrawing = current.current?.analytics === true && !analytics;
    const next = createPrivacyChoice(analytics);
    current.current = next;
    let persisted = false;
    try {
      persisted = storePrivacyChoice(window.localStorage, next);
    } catch {
      /* In-memory choice still works. */
    }
    setChoice(next);
    setSettingsOpen(false);
    setSaved(
      persisted
        ? "Preferências de privacidade salvas neste navegador."
        : "Sua escolha vale nesta aba. O navegador não permitiu salvá-la para a próxima visita.",
    );
    // Removing a script does not remove its listeners. Reload with the refusal
    // already persisted to stop the SDK entirely, keeping sheet storage intact.
    if (withdrawing && import.meta.env.PROD) window.location.reload();
  };
  return (
    <PrivacyContext.Provider
      value={{ choice, settingsOpen, setSettingsOpen, saveChoice, saved }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

export const usePrivacy = () => useContext(PrivacyContext);

export function PrivacyNotices({ hideBanner = false }) {
  const { choice, settingsOpen, setSettingsOpen, saveChoice, saved } =
    usePrivacy();
  return (
    <>
      {!choice && !settingsOpen && !hideBanner && (
        <section
          className="privacy-banner"
          aria-labelledby="privacy-banner-title"
        >
          <div className="privacy-banner-copy">
            <span className="eyebrow">SUA ESCOLHA</span>
            <h2 id="privacy-banner-title">Cookies e privacidade</h2>
            <p>
              Suas fichas, favoritos e preferências ficam neste navegador. Com
              sua autorização, usamos o Vercel Web Analytics para medir visitas
              e páginas consultadas, sem cookies de rastreamento. Fichas
              preenchidas e termos de busca não entram nas estatísticas. Você
              pode recusar e continuar usando o acervo.
            </p>
            <a href="#/privacidade">Ler a política de privacidade</a>
          </div>
          <div className="privacy-banner-actions">
            <button
              className="privacy-choice"
              onClick={() => saveChoice(false)}
            >
              Rejeitar opcionais
            </button>
            <button className="privacy-choice" onClick={() => saveChoice(true)}>
              Aceitar estatísticas
            </button>
            <button
              className="privacy-customize"
              onClick={() => setSettingsOpen(true)}
            >
              Escolher preferências
            </button>
          </div>
        </section>
      )}
      <p className="privacy-saved" role="status">
        {saved}
      </p>
      {settingsOpen && <PrivacySettings />}
    </>
  );
}

function PrivacySettings() {
  const { choice, setSettingsOpen, saveChoice } = usePrivacy();
  const [analytics, setAnalytics] = useState(Boolean(choice?.analytics));
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    element.querySelector("[data-privacy-close]")?.focus();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="privacy-dialog"
      aria-labelledby="privacy-settings-title"
      aria-describedby="privacy-settings-description"
      onCancel={(event) => {
        event.preventDefault();
        setSettingsOpen(false);
      }}
    >
      <button
        className="privacy-close"
        data-privacy-close
        aria-label="Fechar preferências de privacidade"
        onClick={() => setSettingsOpen(false)}
      >
        ×
      </button>
      <div className="eyebrow">CONTROLE DOS SEUS DADOS</div>
      <h2 id="privacy-settings-title">Preferências de privacidade</h2>
      <p id="privacy-settings-description">
        As estatísticas são opcionais. Recusar não limita o acervo nem apaga
        suas fichas.
      </p>
      <label className="privacy-category">
        <span>
          <strong>Funcionamento do acervo</strong>
          <small>
            Fichas, favoritos, boas-vindas e sua escolha de privacidade, salvos
            localmente. Sem envio desses conteúdos para estatísticas.
          </small>
        </span>
        <input
          type="checkbox"
          checked
          disabled
          aria-label="Funcionamento do acervo, sempre ativo"
        />
      </label>
      <label className="privacy-category">
        <span>
          <strong>Estatísticas de uso</strong>
          <small>
            Vercel Web Analytics: visitas, páginas e informações técnicas
            gerais. Sem publicidade ou gravação de sessões.
          </small>
        </span>
        <input
          type="checkbox"
          aria-label="Permitir estatísticas de uso"
          checked={analytics}
          onChange={(event) => setAnalytics(event.target.checked)}
        />
      </label>
      <p className="privacy-policy-note">
        A escolha vale por até 180 dias neste navegador. Você pode alterá-la
        pelo rodapé.{" "}
        <a href="#/privacidade" onClick={() => setSettingsOpen(false)}>
          Consultar a política completa
        </a>
        .
      </p>
      <div className="privacy-settings-actions">
        <button className="privacy-choice" onClick={() => saveChoice(false)}>
          Rejeitar opcionais
        </button>
        <button
          className="privacy-choice"
          onClick={() => saveChoice(analytics)}
        >
          Salvar preferências
        </button>
      </div>
    </dialog>
  );
}

export function PrivacyPage({ onBack }) {
  const { setSettingsOpen } = usePrivacy();
  return (
    <article
      className="about-page privacy-page"
      aria-labelledby="privacy-title"
    >
      <a href="#" className="back-link" onClick={onBack}>
        ← Voltar ao acervo
      </a>
      <div className="eyebrow">TRANSPARÊNCIA E CONTROLE</div>
      <h1 id="privacy-title">Privacidade e proteção de dados</h1>
      <p className="privacy-date">Atualizada em {PRIVACY_UPDATED}</p>
      <p>
        Esta política explica como o Arquivo das Trevas trata informações
        durante sua visita. O responsável pelas decisões sobre esse tratamento é{" "}
        <strong>{PRIVACY_CONTROLLER}</strong>. Para falar sobre privacidade ou
        exercer seus direitos, escreva para{" "}
        <a href={`mailto:${CONTACT_EMAIL}?subject=Privacidade%20e%20LGPD`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
      <button className="privacy-choice" onClick={() => setSettingsOpen(true)}>
        Alterar preferências de privacidade
      </button>
      <section>
        <h2>O que fica no seu navegador</h2>
        <p>
          Não há cadastro nem formulário de envio de ficha. Os campos que você
          preenche nas fichas, seus favoritos, o registro do aviso de
          boas-vindas e sua escolha de privacidade usam{" "}
          <code>localStorage</code>. Esse conteúdo não é enviado ao responsável
          pelo site nem às estatísticas. Arquivos JSON e PDFs de fichas
          exportados ficam sob seu controle.
        </p>
        <div className="privacy-table-wrap">
          <table>
            <caption>Armazenamento local usado pelo acervo</caption>
            <thead>
              <tr>
                <th>Informação</th>
                <th>Finalidade</th>
                <th>Prazo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Ficha por sistema
                  <br />
                  <code>arquivo-trevas-sheet-v1-&lt;sistema&gt;</code>
                </td>
                <td>Recuperar o preenchimento no mesmo navegador.</td>
                <td>Até você limpar a ficha ou os dados do site.</td>
              </tr>
              <tr>
                <td>
                  Favoritos
                  <br />
                  <code>arquivo-trevas-favorites-v1</code>
                </td>
                <td>Guardar os sistemas escolhidos.</td>
                <td>Até você remover os favoritos ou limpar os dados.</td>
              </tr>
              <tr>
                <td>
                  Boas-vindas
                  <br />
                  <code>arquivo-trevas-welcome-v1</code>
                </td>
                <td>Evitar repetir o aviso inicial.</td>
                <td>Até você limpar os dados do site.</td>
              </tr>
              <tr>
                <td>
                  Preferências de privacidade
                  <br />
                  <code>{CONSENT_KEY}</code>
                </td>
                <td>
                  Guardar aceite ou recusa, data, validade e versão desta
                  política.
                </td>
                <td>
                  Validade de até 180 dias; uma nova decisão substitui a
                  anterior.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Esses recursos locais funcionam independentemente da autorização para
          estatísticas. Seu navegador pode removê-los antes dos prazos acima,
          inclusive em navegação privada. Para guardar uma ficha, exporte uma
          cópia antes de limpar os dados.
        </p>
      </section>
      <section>
        <h2>Cookies e estatísticas opcionais</h2>
        <p>
          O acervo não instala cookies de publicidade. A integração escolhida,
          Vercel Web Analytics, mede uso sem cookies de rastreamento. Mesmo
          assim, só carregamos a ferramenta depois que você aceita as
          estatísticas. Não há caixas opcionais previamente marcadas.
        </p>
        <p>
          Com sua autorização, são medidas visitas a páginas públicas do acervo
          e informações técnicas gerais disponibilizadas pelo serviço, como
          navegador, tipo de dispositivo, origem de acesso e país aproximado. As
          rotas internas também são reconhecidas, para distinguir sistemas e
          áreas. A consulta de páginas de um mesmo livro é agrupada pelo
          documento.
        </p>
        <p>
          Não enviamos às estatísticas nomes de personagens, textos das fichas,
          conteúdos de arquivos importados, e-mail digitado ou palavras de
          busca. Não usamos publicidade personalizada, gravação de sessões,
          captura de teclas ou identificadores criados pelo acervo para
          acompanhar você em outros sites.
        </p>
        <p>
          Você pode{" "}
          <button
            className="privacy-inline-button"
            onClick={() => setSettingsOpen(true)}
          >
            aceitar, recusar ou retirar a autorização
          </button>{" "}
          a qualquer momento. Retirar a autorização interrompe novas medições
          neste navegador e não invalida o tratamento realizado antes da
          retirada. Essa escolha não apaga suas fichas ou favoritos. Se não
          decidir, as estatísticas ficam desligadas.
        </p>
      </section>
      <section>
        <h2>Hospedagem, segurança e contato por e-mail</h2>
        <p>
          A Vercel fornece a hospedagem e o serviço de estatísticas. Como em
          qualquer acesso à internet, a infraestrutura recebe dados técnicos da
          conexão, como endereço IP, horário, endereço solicitado e informações
          do navegador, necessários para entregar páginas, prevenir abuso e
          manter o serviço. Esses registros técnicos existem mesmo quando você
          recusa as estatísticas opcionais.
        </p>
        <p>
          Se você enviar um e-mail, o responsável recebe seu endereço e o
          conteúdo enviado para responder à solicitação. O site apenas abre seu
          aplicativo de e-mail: não envia a mensagem automaticamente. Evite
          incluir dados pessoais que não sejam necessários ao pedido.
        </p>
        <p>
          As fontes tipográficas, imagens e PDFs do acervo são servidos junto ao
          site; não carregamos fontes de terceiros ou incorporações de redes
          sociais. Links externos, quando acessados, passam a seguir as práticas
          do serviço de destino.
        </p>
      </section>
      <section>
        <h2>Finalidades, bases legais e compartilhamento</h2>
        <p>
          As estatísticas opcionais têm como base o seu consentimento e ajudam a
          entender o uso do acervo. O armazenamento local executa os recursos
          solicitados por você. Registros técnicos de segurança e
          disponibilidade podem ser tratados para atender ao legítimo interesse
          de manter o site seguro, observados seus direitos, e para cumprir
          obrigações legais quando aplicáveis. Mensagens de contato são usadas
          para atender ao seu pedido e, quando necessário, cumprir deveres
          legais.
        </p>
        <p>
          Não vendemos dados nem compartilhamos fichas para publicidade. A
          Vercel e os prestadores de e-mail podem tratar informações para
          fornecer seus serviços. Esses fornecedores podem operar fora do
          Brasil; quando houver transferência internacional de dados pessoais,
          devem ser observados os mecanismos e as garantias exigidos pela LGPD.
          Você pode pedir informações sobre os fornecedores e as condições
          aplicáveis pelo contato acima.
        </p>
      </section>
      <section>
        <h2>Por quanto tempo as informações são mantidas</h2>
        <p>
          Os prazos do armazenamento local estão na tabela. A escolha de
          privacidade é solicitada novamente após 180 dias ou uma mudança da
          versão desta política. A janela de retenção das estatísticas e dos
          registros técnicos segue o serviço e o plano de hospedagem da Vercel;
          consulte{" "}
          <a
            href="https://vercel.com/docs/analytics/privacy-policy"
            target="_blank"
            rel="noreferrer"
          >
            as informações de privacidade do provedor
          </a>{" "}
          ou peça ao responsável o prazo aplicável ao período da sua visita.
        </p>
        <p>
          Mensagens de contato ficam guardadas pelo tempo necessário para
          responder e acompanhar o pedido, salvo obrigações de guarda ou
          necessidade de defesa de direitos. Você pode solicitar sua exclusão;
          eventuais motivos para retenção serão informados na resposta.
        </p>
      </section>
      <section>
        <h2>Seus direitos e como fazer um pedido</h2>
        <p>
          Nos termos da Lei Geral de Proteção de Dados Pessoais (Lei nº
          13.709/2018), você pode pedir confirmação de tratamento, acesso,
          correção, informações sobre compartilhamento, anonimização, bloqueio
          ou eliminação de dados desnecessários ou tratados irregularmente,
          portabilidade quando aplicável e eliminação de dados tratados com
          consentimento, observadas as hipóteses legais de conservação. Também
          pode retirar consentimento e exercer oposição nas situações previstas
          na lei.
        </p>
        <p>
          Envie seu pedido para{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Pedido%20sobre%20dados%20pessoais%20-%20LGPD`}
          >
            {CONTACT_EMAIL}
          </a>
          , indicando qual informação ou interação deseja consultar. Podemos
          solicitar apenas o necessário para verificar sua relação com o pedido.
          Não envie documentos de identificação antes de ser informado sobre
          essa necessidade. Quando uma estatística não permitir identificar sua
          visita, explicaremos essa limitação.
        </p>
        <p>
          Para apagar fichas e preferências guardadas apenas no seu dispositivo,
          use os recursos da ficha ou as configurações de dados do site no
          navegador. O responsável não consegue recuperar ou apagar remotamente
          uma ficha que ficou apenas no seu navegador.
        </p>
        <p>
          Você também pode procurar a{" "}
          <a
            href="https://www.gov.br/anpd/pt-br"
            target="_blank"
            rel="noreferrer"
          >
            Autoridade Nacional de Proteção de Dados (ANPD)
          </a>{" "}
          para exercer os direitos cabíveis. Mudanças relevantes nesta política
          serão informadas aqui, com nova solicitação de escolha quando
          necessário.
        </p>
      </section>
    </article>
  );
}
