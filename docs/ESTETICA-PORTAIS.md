# Estética dos portais

A direção visual segue a proposta **Portais do sobrenatural**, escolhida pelo usuário: paisagens imersivas, fundo azul quase preto, títulos em Cormorant Garamond, texto em DM Sans e detalhes próprios de cada sistema.

- Vampiro: castelo gótico, lua vermelha e acentos carmesim.
- Changeling: bosque florido e acentos verdes.
- Caçador: bunker, luz âmbar e acentos laranja.
- Mago: santuário, sigilos e acentos roxos.
- Aparição: cemitério, névoa e verde acinzentado.

As cinco ilustrações em `public/images/portals/` foram geradas originalmente para o projeto, sem texto ou interface incorporados. Os arquivos WebP medem 840 × 1260 e somam aproximadamente 1,1 MiB. As imagens ficam hospedadas junto do site; não dependem de um serviço externo. Os portais usam imagens decorativas e o nome/edição continuam como texto HTML acessível.

`src/portals.css`, carregado depois dos estilos estruturais, define a aparência compartilhada de home, áreas, índice, leitura, poderes, documentos, contato e aviso de boas-vindas. As fichas mantêm o formato dos formulários reais e têm temas próprios definidos em `src/sheet-themes.css`: grimório gótico para Vampiro, vitral Art Nouveau em tons de esmeralda, rubi e ametista para Changeling, dossiê tático para Caçador, fólio violeta para Mago e registro funerário para Aparição. `src/changeling-stained.css`, carregado após os temas, aplica a variante Vitral do Sonhar escolhida para Changeling, com cabeçalho ilustrado sem texto incorporado, laterais de vidro colorido, roseta e campos claros editáveis. As imagens ficam em `public/images/sheets/`; os motivos SVG são próprios e o cabeçalho foi gerado para esta variante. A impressão usa papel claro em todos os sistemas. Os antigos estilos individuais de paisagem deixam de ser importados.

`src/PortalAtmosphere.jsx` aplica uma camada discreta de paisagem com paralaxe limitada. A preferência de redução de movimento desliga o movimento e as transições. No celular, os portais formam uma faixa horizontal com encaixe de rolagem e a navegação usa um menu lateral. As referências e os formulários empilham conforme a largura disponível.

A navegação superior preserva busca, favoritos e contato, além de oferecer seleção de documentos por sistema. Os atalhos Lore, Mecânica e Ficha na home permitem escolher o sistema antes de abrir a área. As URLs existentes, dados do acervo, campos e chaves de armazenamento das fichas permanecem iguais.

## Validação

- `npm test`: 35 testes aprovados, incluindo integridade do conteúdo e links das fichas.
- `npm run build`: compilação de produção aprovada.
- Navegador: cinco imagens carregadas; cinco sistemas e suas três áreas; busca pelo cabeçalho; Ctrl+K; favoritos após recarga; documentos; contato; atalhos; Vida → Esfera; poderes e testes.
- Larguras 320, 390, 768, 1024 e 1440 px: sem transbordamento horizontal da página; faixa de portais com rolagem própria no celular.
- Cinco fichas: valores preservados após recarga e impressão A4 em duas páginas cada.
- Preferência de redução de movimento, navegação móvel e aviso de boas-vindas exibido uma única vez conferidos.
