# Arquivo das Trevas

Acervo em português para cinco sistemas do Mundo das Trevas, em React + Vite, pronto para a Vercel.

| Sistema                  | Edição principal | Entradas |
| ------------------------ | ---------------- | -------: |
| Vampiro: A Máscara       | 5E               |      702 |
| Changeling: O Sonhar     | 20A              |      260 |
| Caçador: A Revanche      | 5E               |      186 |
| Mago: A Ascensão         | 20A              |      715 |
| Aparição: O Esquecimento | 20A              |      327 |

Além do leitor integral de **25 documentos e 2.806 páginas**, as **2.190 entradas** por assunto incluem resumos, extratos operacionais, índices de referência e campos de ficha e explicações de cobertura. Incluem páginas literais, explicações e índices. Mago continua parcial: faltam as páginas 400–489 do livro, embora os doze arquivos enviados tenham sido recebidos.

## Rodar e validar

Node.js 22.12+ ou 24 LTS, com npm:

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

`npm test` verifica sistemas/edições, áreas, referências e limites de páginas, campos vazios das fichas e uso exclusivo do último básico H5, além da cobertura dos livros recebidos no ZIP. O build separa aplicação, acervo e dependências para permitir cache independente.

## Navegação

Na home, o cartão abre uma página do sistema. Nela, o visitante escolhe:

- **Lore:** cenário, sociedade, grupos e identidades.
- **Mecânica:** atributos, habilidades, antecedentes, poderes e regras, agrupados por assunto.
- **Ficha:** formulário vazio preenchível e referências aos campos da base anexada.

Em **Mago 20A → Mecânica**, os tópicos **Esferas** e **Esferas opcionais** abrem os nomes; cada nome mostra o que os níveis 1–5 permitem fazer e leva às explicações e ao texto literal das páginas citadas. Graduações são permissões para construir Efeitos; custos e duração dependem da conjuração. As variantes opcionais substituem suas correspondentes quando adotadas pela mesa.

Em **Aparição 20A → Mecânica**, o diretório dos 16 Arcanoi abre por padrão. Cada cartão oferece links para os cinco níveis e suas artes Comuns/Iniciadas; abrir o nome do Arcanos mostra os dez efeitos agrupados por nível, e cada poder leva ao sistema e à fonte. O botão **Consultar os 16 Arcanoi** retorna ao diretório.

Os cartões em **Escolha um tópico** são botões: abrem a categoria, filtram o índice e exibem links para cada entrada. Funcionam por clique e teclado, com opção de voltar a todas as categorias.

Cada área tem busca em títulos e textos, filtro de categoria, índice de tópicos e links diretos. Exemplo: `#/sistema/changeling/mecanica`. Fontes indicam **a posição da página no PDF**, que pode diferir da página impressa. Nas partes de Mago, as referências, a seleção de página e o leitor também mostram a numeração correspondente do livro. As capas podem não apresentar número impresso.

Todo Changeling é organizado como **20A**, conforme a escolha da mesa. As referências preservam a origem dos trechos cuja mecânica ainda exige conferência no C20 completo. Caçador usa exclusivamente o último básico H5 otimizado enviado pelo usuário; o guia da Biblioteca Élfica e a referência anterior TRUNFOS foram removidos do acervo e da bibliografia.

## Fichas digitais

As fichas têm duas folhas organizadas a partir dos formulários recebidos, com cabeçalho, Atributos e Habilidades em três colunas e posições próprias por sistema. V5 e H5 colocam Vitalidade e Força de Vontade entre Atributos e Habilidades; M20 separa as nove Esferas em três colunas; C20 reúne Artes, Alçadas e Temperamentos; W20 tem uma folha da Psique e outra para Sombra e complementos. No celular, as colunas se empilham na mesma ordem.

Círculos e quadrados são clicáveis, com entrada numérica equivalente acessível pelo teclado. Os campos continuam manuais: não calculam criação, dano ou custos. Campos com limites acima da trilha desenhada preservam o valor completo na entrada numérica. Os IDs, limites e formato JSON `arquivo-trevas-sheet-v1` foram mantidos, inclusive chaves antigas de fichas salvas. Nenhum valor de personagem dos PDFs foi importado. O texto completo das anotações entra na impressão, mesmo quando é maior que a caixa exibida na tela.

`src/sheet-layout.js` define a organização; `src/SheetPages.jsx` apresenta os campos; `src/sheets.css` cuida do papel, das colunas, do celular e da impressão A4. Os modelos preservam os campos da edição selecionada; não são cópias gráficas exatas dos anexos. Os testes verificam que todo campo aparece uma única vez e que alterações futuras no catálogo não ocultem campos novos.

## Boas-vindas, contato e referências das fichas

O aviso de boas-vindas aparece uma vez por navegador, com registro local em `arquivo-trevas-welcome-v1`. Pode ser fechado pelo botão, pelo X ou pela tecla Escape. A aba **Contato** está no menu lateral e no rodapé, com endereço direto `#/contato` e link de e-mail para `coradi.maddaloni@gmail.com`. O site não envia mensagens automaticamente: o link abre o aplicativo de e-mail do visitante.

Os nomes e títulos visíveis das fichas levam aos tópicos ou às categorias correspondentes do próprio sistema. Exemplo: **Mago → Correspondência** abre sua explicação e seus cinco níveis; **Changeling → Artes** abre a categoria com as 19 Artes. Os campos continuam editáveis e os valores salvos são preservados ao consultar e voltar. Nomes de poderes reconhecidos nas anotações de Artes, Disciplinas, Trunfos e Arcanoi também recebem atalhos, sem alterar o texto digitado. A impressão mantém o formato de ficha, sem os ícones e atalhos adicionais.

As categorias aceitam links diretos como `#/sistema/changeling/mecanica/categoria/Artes`. `src/sheet-reference-policy.js` define os destinos revisados por sistema e campo; `src/sheet-references.js` resolve os nomes dentro do grupo correto, sem aliases globais ou redirecionamento genérico para Identidade/Criação. Quando necessário, a conexão abre a página exata de um PDF já disponível. Campos sem destino específico validado ficam sem link. `src/library-routes.js` monta os endereços e valida a categoria. A [revisão das conexões](docs/REVISAO-CONEXOES-FICHAS.md) lista os 354 campos e seus destinos.

## Documentos e cobertura

- **Vampiro:** Módulo Básico 5E, base de ficha e Westhaven 11.0. A compilação Westhaven é identificada como material de fã; suas opções não são todas do básico.
- **Changeling:** básico C20 completo (482 páginas), Livro das Artes, documentos 1–7 e base de ficha. O acervo reúne 18 Artes do básico e Fabulomancia como referência adicional, seis Alçadas e 95 truques. Há criação, regras, habilidades, Casas, geografia e índices de Qualidades/Defeitos com fontes do livro.
- **Caçador:** básico H5 otimizado consultado por OCR (288 páginas). São 186 entradas: cenário, cinco Credos, sete Ímpetos, criação, nove Atributos, 27 Habilidades, Antecedentes, Qualidades/Defeitos, regras, equipamento, ameaças e organizações; 12 Trunfos e 49 Distinções têm efeitos individuais. Ficha vazia baseada no básico; Perigo e Desespero são coletivos e Aflição é condição.
- **Mago:** doze partes recebidas em português, com 599 páginas integrais e 715 entradas. As nove Esferas e as variantes opcionais Ciência Dimensional, Dados e Utilidade Primordial têm cinco graduações cada (60 explicações). Inclui lore, criação, Habilidades, Antecedentes, conjuração, Paradoxo, Silêncio, foco e ficha vazia. Há uma lacuna real entre as páginas 399 e 490; nenhum texto foi presumido para 400–489.
- **Aparição:** livro 20A completo (517 páginas, tradução comunitária). Inclui lore, criação, habilidades corrigidas, Antecedentes, Legiões, Sombra, 16 Arcanoi, 80 artes Comuns e 80 artes Iniciadas com efeitos individuais. A ficha digital foi conferida com o livro.

Por solicitação do usuário, os 25 PDFs de conteúdo disponíveis e suas transcrições completas agora fazem parte do site. Fichas preenchidas, valores, escolhas e histórias dos personagens continuam excluídos. A estrutura dos formulários foi montada a partir dos rótulos impressos.

## Leitura integral

| Sistema        | Documentos | Páginas |
| -------------- | ---------: | ------: |
| Vampiro 5E     |          2 |     791 |
| Changeling 20A |          9 |     611 |
| Caçador 5E     |          1 |     288 |
| Aparição 20A   |          1 |     517 |
| Mago 20A       |         12 |     599 |

A página do sistema oferece **Textos integrais dos PDFs**. O leitor permite buscar no documento inteiro, escolher qualquer página, navegar pelo sumário digital quando presente e abrir a página original. Tópicos de fontes em português oferecem **Ler texto literal da fonte**, ligado às páginas citadas. Os 143 tópicos com fonte C20 em inglês oferecem **Ler citação em português**: um trecho traduzido do assunto, com página e opção de comparar o original. As traduções estão identificadas como não oficiais; o leitor integral preserva o idioma do arquivo. Exemplo de rota: `#/sistema/cacador/documentos/h5-core/92`.

`src/documents.json` contém os metadados, os sumários, as contagens e os hashes dos originais. `public/documents/` contém um JSON de texto por documento e seu PDF original. Os arquivos são servidos estaticamente pela Vercel; são carregados quando consultados, sem baixar os livros ao abrir a home. As fontes e os hashes são verificados por `tests/documents.test.js`.

O texto do leitor integral não é resumido nem traduzido: C20 integral permanece em inglês. As citações selecionadas dos tópicos são traduzidas em `src/translated-citations.json`, que mantém também o trecho original e a página. `tests/citations.test.js` verifica a cobertura de todos os tópicos com fonte inglesa e confirma que cada original existe na página citada. Essa camada de citações traduzidas não é uma tradução integral do livro. Em Aparição, códigos da fonte do PDF que representavam letras latinas foram decodificados para Unicode legível. Caçador e Doc 2 usam OCR; páginas esparsas de outros documentos também receberam OCR complementar. Cada página indica seu método. A transcrição pode perder diagramação ou reconhecer símbolos e números incorretamente; o original preserva tabelas, imagens e páginas sem texto recuperável. Não se afirma que o OCR foi revisado palavra por palavra. As partes de Mago têm texto selecionável em português, preservado integralmente; algumas páginas da tradução recebida apresentam colunas sobrepostas ou linhas misturadas. As explicações por graduação são separadas da transcrição e permitem conferir o PDF original.

Os ativos somam aproximadamente 347 MB, principalmente PDFs. Cada PDF é o arquivo recebido, verificado por SHA-256. Não foram incluídos arquivos de fichas preenchidas, duplicatas, `Build Assembly.pdf`, materiais antigos de Caçador ou páginas não recebidas de Mago.

Veja [os arquivos que precisam ser reenviados](docs/ARQUIVOS-PENDENTES.md).

## Manutenção do acervo

O site público é somente de consulta: não tem editor, botão de adicionar conteúdo nem importação/exportação do acervo. O catálogo publicado é carregado diretamente de `src/content.json`; rascunhos antigos do navegador não substituem o conteúdo atual.

As atualizações são feitas no repositório, em `src/content.json` e `src/sources.json`, e publicadas pelo deploy da Vercel.

Cada entrada de `sections` inclui:

| Campo                         | Uso                                                                        |
| ----------------------------- | -------------------------------------------------------------------------- |
| `id`                          | Identificador único no sistema, em letras minúsculas, números e hífens.    |
| `category`                    | `lore`, `mechanics` ou `sheet`.                                            |
| `group`                       | Categoria interna: Antecedentes, Talentos, Artes etc.                      |
| `title`, `intro`, `body`      | Título, introdução e texto simples com quebras de linha.                   |
| `edition`, `status`           | Edição e natureza da entrada: resumo, índice, campo de ficha ou pendência. |
| `sourceId`, `source`, `pages` | Referência à bibliografia, citação exibida e páginas do PDF.               |

As entradas individuais de poderes também têm `power`, com `family`, `level` (1–5 ou `null`), `branch`, `effect`, `cost`, `roll`, `duration`, `requirements`, `rules` e sua própria referência de fonte. Uma Arte/Disciplina pode declarar `powerFamily` para exibir as opções por nível logo abaixo da apresentação.

Há **891 entradas individuais de poderes e distinções**: 575 de Vampiro (incluindo rituais, cerimônias, fórmulas e opções ancestrais da compilação), 95 truques C20, 160 artes W20, 12 Trunfos básicos H5 e 49 Distinções do mesmo livro. Alternativas de V5 não são apresentadas como benefícios automáticos de nível; Trunfos não recebem uma escada de níveis inventada. Mago aguarda o livro e não ganhou efeitos supostos.

Changeling e Aparição mostram o texto operacional extraído das fontes fornecidas, além do efeito individual. Vampiro utiliza a descrição e os campos textuais recuperáveis da compilação: símbolos gráficos de resultados e condições quantitativas não recuperados devem ser conferidos no PDF; não são substituídos por números inventados.

Os filtros de **nível** e **tipo** se combinam com busca e categoria.

`sheet.groups` define campos de tipo `text`, `rating`, `number` e `notes`. A definição contém apenas rótulos e limites de entrada, sem valores de personagens.

## Fichas locais

Cada sistema tem uma ficha que começa em branco/zero. É um formulário manual: não valida distribuição inicial, custos de experiência, poderes, combinações de magia ou regras de dano. Permite salvar neste navegador, importar/exportar JSON do mesmo sistema/edição e imprimir/salvar em PDF pelo navegador.

A ficha local não é enviada ao site público e não faz parte da exportação do acervo. Exporte uma cópia para preservar seu trabalho; limpar os dados do navegador pode removê-la. Dados preenchidos por você estarão no JSON de ficha exportado.

Chaves de armazenamento:

- `arquivo-trevas-favorites-v1`: favoritos.
- `arquivo-trevas-sheet-v1-<sistema>`: ficha local.

Rascunhos antigos do acervo não são mais carregados. As chaves antigas não são apagadas. Fichas antigas recebem novos campos vazios, preservando valores existentes e chaves legadas para exportação. O antigo campo numérico de Aflição permanece recuperável no JSON; o formulário atual usa uma condição de Aflição e trilhas separadas de Perigo e Desespero.

## Publicar na Vercel

Importe o repositório e use:

- Framework: **Vite**.
- Build: **`npm run build`**.
- Diretório de saída: **`dist`**.

`vercel.json` já define esses parâmetros. Não são necessárias variáveis de ambiente. As rotas usam fragmentos, então links diretos funcionam na hospedagem estática sem redirecionamentos adicionais. Fontes tipográficas são servidas junto ao site.

Projeto independente de fãs, sem vínculo oficial com World of Darkness, Paradox Interactive ou editoras. Marcas e títulos pertencem aos respectivos titulares.
