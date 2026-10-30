# Privacidade e estatísticas

Responsável informado pelo proprietário: **Elemental Corp.** Contato de privacidade: **coradi.maddaloni@gmail.com**. A política pública está em `#/privacidade`; o rodapé permite reabrir as preferências.

## Ativar e consultar o painel

O código já instala `@vercel/analytics` e usa o componente oficial `<Analytics />` de `@vercel/analytics/react`, adequado ao React + Vite deste projeto. Ele é montado por `src/ConsentAnalytics.jsx` somente depois do consentimento. Não há chave secreta, conta de visitante ou painel administrativo público. As estatísticas são vistas pela conta que administra o projeto na Vercel.

1. Abra [seu painel da Vercel](https://vercel.com/dashboard) e selecione o projeto deste repositório.
2. Abra **Analytics / Web Analytics**. Se houver um botão **Enable / Ativar**, habilite o serviço. Se aparecer apenas **Get Started**, as etapas de instalar o pacote e adicionar o componente já estão prontas neste repositório; não é necessário usar “Implement with Vercel Agent” para gerar outra integração. O seletor “Next.js” muda o exemplo da ajuda: este projeto usa React + Vite. Use o plano e os limites já disponíveis; esta alteração não contrata upgrade de plano.
3. Depois de habilitar, publique novamente a versão atual: **Deployments → último deploy → Redeploy**, se a implantação automática do GitHub tiver ocorrido antes da ativação.
4. Visite o site publicado, aceite as estatísticas e abra dois sistemas. Verifique as primeiras visitas no painel; o processamento pode levar alguns minutos.

A ativação no painel exige uma sessão autenticada da conta Vercel. Ela não foi confirmada neste ambiente; não se afirma que visitas reais já estão sendo coletadas. O endpoint `/_vercel/insights/script.js` é fornecido pela hospedagem. Se ele abrir um arquivo JavaScript no navegador, a entrega do script está disponível; isso, sozinho, não confirma o recebimento de visitas no painel. Se responder 404, confira a configuração do projeto e publique novamente. Bloqueadores podem impedir métricas mesmo após o aceite.

O painel permite acompanhar visitantes/visualizações e páginas públicas consultadas, além das dimensões disponibilizadas pelo plano, como origem, dispositivo e país aproximado. As rotas com `#` são enviadas manualmente: `/sistema/vampiro/ficha`, `/sistema/changeling/mecanica/categoria/Artes` etc. Os números representam visitas autorizadas e efetivamente medidas, não toda a audiência. Não há recuperação retroativa das visitas anteriores à integração.

## Escolhas e dados

- O padrão é recusar estatísticas até uma decisão explícita. SDK e script só são carregados depois do aceite; o SDK fica em um arquivo separado do código inicial.
- Os botões de aceitar e recusar têm a mesma apresentação. A configuração opcional começa desmarcada.
- A preferência local guarda versão, aceite/recusa, data e validade de 180 dias. Expiração, versão desconhecida ou registro inválido exigem nova escolha.
- O visitante pode retirar a autorização no rodapé. A recusa é salva antes de recarregar, para descarregar também os listeners da ferramenta. Fichas e favoritos não são apagados. Alterações são sincronizadas entre abas pelo evento de armazenamento.
- A validade também é conferida antes de cada envio. Uma importação assíncrona pendente não pode iniciar a ferramenta depois da retirada.
- A medição usa o Vercel Web Analytics sem cookies de rastreamento. Não usamos publicidade, eventos personalizados pagos, gravação de sessão, captura de teclas ou identificadores criados pelo acervo.
- Só rotas públicas presentes no catálogo são aceitas. URLs arbitrárias e eventos personalizados são descartados. Parâmetros e fragmentos não entram no endereço medido. A leitura de páginas é agrupada por documento validado.
- Nenhum código de estatísticas lê valores da ficha, arquivos importados, favoritos ou palavras de busca. O armazenamento local desses recursos permanece independente.
- Registros técnicos da hospedagem continuam necessários para entregar e proteger o site, inclusive quando as estatísticas forem recusadas. Essa diferença está explicada na política.

`src/privacy.js` contém validade e armazenamento; `src/Privacy.jsx`, o aviso, as preferências e a política; `src/analytics-routes.js`, a lista de rotas autorizadas; `src/ConsentAnalytics.jsx`, o componente React de integração após consentimento. `vercel.json` também define proteção contra MIME sniffing e enquadramento, bloqueio de permissões desnecessárias e ausência de cabeçalho de referência ao sair da página.

## Operação pela Elemental Corp.

Mantenha o e-mail de privacidade ativo e responda aos pedidos de titulares conforme a LGPD. A política descreve os dados efetivamente usados pelo site e identifica os canais para exercício de direitos. Confirme no plano e no contrato da Vercel os prazos de retenção, fornecedores e condições de transferência internacional aplicáveis; atualize a política se essas condições ou os tratamentos mudarem. Incidentes relevantes devem ser avaliados e tratados conforme as obrigações legais aplicáveis. O aviso não substitui esses cuidados operacionais.

Ao adicionar formulários, contas, pagamentos, publicidade, embeds ou outra medição, revise o inventário e a política antes de publicar. Aumente `PRIVACY_VERSION` quando uma alteração exigir nova escolha; não reaproveite consentimento anterior para nova finalidade.

Referências para a operação:

- [Ativação do Vercel Web Analytics](https://vercel.com/docs/analytics/quickstart)
- [Privacidade do Vercel Web Analytics](https://vercel.com/docs/analytics/privacy-policy)
- [Autoridade Nacional de Proteção de Dados](https://www.gov.br/anpd/pt-br)

## Verificações

Os testes de unidade validam recusa por padrão, aceite/recusa, expiração e versão, falhas de armazenamento, preservação de fichas, todas as rotas públicas e descarte de URLs e eventos que possam conter conteúdo privado. A navegação foi verificada com um endpoint de medição simulado: ausência de SDK/requisições antes da decisão e após recusa, aceite, navegação por fragmentos, exclusão de busca/preenchimento, retirada entre abas, preferências por teclado e telas pequenas, política e impressão A4. A simulação verifica a integração sem enviar visitas de teste à Vercel; não comprova a ativação do projeto na conta de hospedagem.

O componente recebe `route` e `path` derivados exclusivamente da lista de rotas públicas, desativando a contagem automática de endereços pelo SDK. O filtro `beforeSend` volta a verificar o consentimento antes de enviar. O carregamento fica isolado por `React.lazy`, `Suspense` e um limite de erro: uma falha ou bloqueio de Analytics não impede a consulta ao acervo. Não há uma segunda integração por `inject()` nem importação de `@vercel/analytics/next`.
