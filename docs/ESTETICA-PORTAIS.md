# Estética dos portais

A direção visual segue a proposta **Portais do sobrenatural**, escolhida pelo usuário: paisagens imersivas, fundo azul quase preto, títulos em Cormorant Garamond, texto em DM Sans e detalhes próprios de cada sistema.

- Vampiro: castelo gótico, lua vermelha e acentos carmesim.
- Changeling: bosque florido e acentos verdes.
- Caçador: bunker, luz âmbar e acentos laranja.
- Mago: santuário, sigilos e acentos roxos.
- Aparição: cemitério, névoa e verde acinzentado.

As cinco ilustrações em `public/images/portals/` foram geradas originalmente para o projeto, sem texto ou interface incorporados. Os arquivos WebP medem 840 × 1260 e somam aproximadamente 1,1 MiB. As imagens ficam hospedadas junto do site; não dependem de um serviço externo. Os portais usam imagens decorativas e o nome/edição continuam como texto HTML acessível.

`src/portals.css`, carregado depois dos estilos estruturais, define a aparência compartilhada de home, áreas, índice, leitura, poderes, documentos, contato e aviso de boas-vindas. As fichas mantêm o formato dos formulários reais e têm temas próprios definidos em `src/sheet-themes.css`: bases próprias de cada sistema, complementadas pelos conceitos escolhidos abaixo. `src/changeling-stained.css`, carregado após os temas, aplica a variante Vitral do Sonhar escolhida para Changeling, com cabeçalho ilustrado sem texto incorporado, laterais de vidro colorido, roseta e campos claros editáveis. As imagens ficam em `public/images/sheets/`; os motivos SVG são próprios e o cabeçalho foi gerado para esta variante. A impressão usa papel claro em todos os sistemas. Os antigos estilos individuais de paisagem deixam de ser importados.

`src/PortalAtmosphere.jsx` aplica uma camada discreta de paisagem com paralaxe limitada. A preferência de redução de movimento desliga o movimento e as transições. No celular, os portais formam uma faixa horizontal com encaixe de rolagem e a navegação usa um menu lateral. As referências e os formulários empilham conforme a largura disponível.

A navegação superior preserva busca, favoritos e contato, além de oferecer seleção de documentos por sistema. Os atalhos Lore, Mecânica e Ficha na home permitem escolher o sistema antes de abrir a área. As URLs existentes, dados do acervo, campos e chaves de armazenamento das fichas permanecem iguais.

## Validação

- `npm test`: 41 testes aprovados, incluindo integridade do conteúdo e links das fichas.
- `npm run build`: compilação de produção aprovada.
- Navegador: cinco imagens carregadas; cinco sistemas e suas três áreas; busca pelo cabeçalho; Ctrl+K; favoritos após recarga; documentos; contato; atalhos; Vida → Esfera; poderes e testes.
- Larguras 320, 390, 768, 1024 e 1440 px: sem transbordamento horizontal da página; faixa de portais com rolagem própria no celular.
- Cinco fichas: valores preservados após recarga e impressão A4 em duas páginas cada.
- Preferência de redução de movimento, navegação móvel e aviso de boas-vindas exibido uma única vez conferidos.

## Fichas: conceitos escolhidos

`src/selected-sheet-themes.css` aplica as quatro escolhas aprovadas, sem mudar a home ou os cenários das páginas de consulta:

- **Vampiro 5E — Noites de Neon (opção 3):** cidade noturna, painéis azul-escuros e acentos vermelhos. **Fome e Humanidade usam a opção 1, Catedral de Sangue**, com painéis de marfim, molduras douradas e medalhões de sangue e sol.
- **Aparição 20A — Mar de Sombras (opção 5):** oceano espectral, necrópole, verde profundo, bronze e correntes laterais.
- **Mago 20A — Observatório Astral (opção 2):** céu índigo, constelações, astrolábio e detalhes dourados. Quintessência e Paradoxo têm duas trilhas circulares concêntricas de vinte marcas, com entradas numéricas independentes e rótulos próprios.
- **Caçador 5E — Arquivo da Caçada (opção 2):** papel claro, abas laranja, fotos, mapas e evidências no cabeçalho.
- **Changeling 20A:** mantém o Vitral do Sonhar já aplicado.

Os quatro novos cabeçalhos WebP em `public/images/sheets/` medem 1500 × 500, somam cerca de 805 KiB e não contêm textos nem campos incorporados. As molduras astral e marítima e os medalhões de Fome/Humanidade são ilustrações WebP com transparência. O mapa astral, os ícones e a moldura angular são SVGs próprios. Títulos, edição, referências e controles são HTML. As imagens são decorativas.

Os campos, limites, chaves de armazenamento, importação/exportação JSON e links do acervo permanecem compatíveis com as fichas anteriores. A variante de tela não altera a impressão A4 clara: duas folhas por sistema e anotações extensas preservadas. Verificações em navegador cobrem os cinco sistemas, larguras 320/390/768/1024/1440, persistência, arquivos antigos, marcas e teclado; os novos marcadores de Fome/Humanidade e as duas trilhas astrais também foram acionados diretamente.

### Acabamento das fichas

A implementação usa molduras e painéis em toda a ficha, além dos cabeçalhos. Vampiro tem títulos em Barlow Condensed, recortes carmesim e medalhões ilustrados nos dois painéis de marfim; Caçador usa papel texturizado, fotografia com borda irregular, abas laranja e divisórias de dossiê; Mago tem moldura astral ilustrada, selos individuais nas nove Esferas e escala numerada ao redor das reservas; Aparição tem correntes de bronze, adornos marítimos e molduras funerárias. Os campos têm tipografia maior, marcas mais legíveis e foco visível. As setas dos links ficam discretas até a interação, preservando seus destinos.

`src/SheetGlyph.jsx` fornece ícones decorativos próprios, inclusive âncora/tridente para Aparição e símbolos para cada Esfera. Nenhum ícone ou desenho substitui um campo. A fonte Barlow Condensed é hospedada no próprio site. Os quatro WebP adicionais somam aproximadamente 326 KiB; os cabeçalhos anteriores são reaproveitados.

Em telas com contêiner de até 700 px, as colunas empilham para manter rótulos e controles legíveis. Abaixo de 440 px, os títulos e as molduras reduzem de tamanho. Os adornos não recebem cliques. Na impressão, a decoração e a escala astral ficam ocultas, e os campos continuam no formato A4 original. Changeling conserva o Vitral do Sonhar.

Validação do acabamento: 41 testes; compilação de produção; cinco sistemas em 320, 390, 768, 1024 e 1440 px sem controles fora da folha; cliques em atributos, Fome, Humanidade e ambos os anéis de Mago; teclado; valores antigos, recarga e JSON; Vida → explicação da Esfera; cinco fichas em duas páginas A4 quando vazias e anotações extensas impressas por inteiro.
