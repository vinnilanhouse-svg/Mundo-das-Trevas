# Arquivo das Trevas

Acervo em português para cinco sistemas do Mundo das Trevas, em React + Vite, pronto para a Vercel.

| Sistema                  | Edição principal | Entradas |
| ------------------------ | ---------------- | -------: |
| Vampiro: A Máscara       | 5E               |      127 |
| Changeling: O Sonhar     | 20A              |      182 |
| Caçador: A Revanche      | 5E               |       54 |
| Mago: A Ascensão         | 20A              |       24 |
| Aparição: O Esquecimento | 20A              |       18 |

As **405 entradas** incluem resumos, índices de referência, campos de ficha e explicações de cobertura. Não representam 405 regras completas: Mago e Aparição, em especial, aguardam livros que excederam o limite de transferência.

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

`npm test` verifica sistemas/edições, áreas, referências e limites de páginas, campos vazios das fichas e separação do guia antigo de Caçador. O build separa aplicação, acervo e dependências para permitir cache independente.

## Navegação

Na home, o cartão abre uma página do sistema. Nela, o visitante escolhe:

- **Lore:** cenário, sociedade, grupos e identidades.
- **Mecânica:** atributos, habilidades, antecedentes, poderes e regras, agrupados por assunto.
- **Ficha:** formulário vazio preenchível e referências aos campos da base anexada.

Cada área tem busca em títulos e textos, filtro de categoria, índice de tópicos e links diretos. Exemplo: `#/sistema/changeling/mecanica`. Fontes indicam **a posição da página no PDF**, que pode diferir da página impressa.

Todo Changeling é organizado como **20A**, conforme a escolha da mesa. As referências preservam a origem dos trechos cuja mecânica ainda exige conferência no C20 completo. O guia dos Imbuídos fica identificado como **original/legado**, sem ser apresentado como regra H5.

## Documentos e cobertura

- **Vampiro:** Módulo Básico 5E, base de ficha e Westhaven 11.0. A compilação Westhaven é identificada como material de fã; suas opções não são todas do básico.
- **Changeling:** Livro das Artes, documentos 1–7 e estrutura de ficha C20. Inclui 19 Artes, seis Alçadas e 95 truques, por Arte e nível. Livro básico completo pendente.
- **Caçador:** estrutura da ficha H5, TRUNFOS e guia legado dos Imbuídos, separados. Livro H5 completo pendente.
- **Mago:** estrutura da ficha M20, com grupos de Habilidades e nove Esferas. Lore e efeitos completos não foram extraídos do livro inacessível.
- **Aparição:** estrutura de ficha legada. O livro 20A é necessário para confirmar regras e diferenças de edição.

Os PDFs, extrações brutas e imagens dos personagens não fazem parte do repositório nem do site. Valores, escolhas e histórias das fichas preenchidas não foram incorporados ao acervo. A estrutura dos formulários foi montada a partir dos rótulos impressos.

Veja [os arquivos que precisam ser reenviados](docs/ARQUIVOS-PENDENTES.md).

## Editar o conteúdo

O catálogo fica em **`src/content.json`** e a bibliografia em **`src/sources.json`**. Cada sistema possui apresentação, `editionLabel`, `editions`, `coverage`, `sources`, `sections` e `sheet`.

Cada entrada de `sections` inclui:

| Campo                         | Uso                                                                        |
| ----------------------------- | -------------------------------------------------------------------------- |
| `id`                          | Identificador único no sistema, em letras minúsculas, números e hífens.    |
| `category`                    | `lore`, `mechanics` ou `sheet`.                                            |
| `group`                       | Categoria interna: Antecedentes, Talentos, Artes etc.                      |
| `title`, `intro`, `body`      | Título, introdução e texto simples com quebras de linha.                   |
| `edition`, `status`           | Edição e natureza da entrada: resumo, índice, campo de ficha ou pendência. |
| `sourceId`, `source`, `pages` | Referência à bibliografia, citação exibida e páginas do PDF.               |

`sheet.groups` define grupos de campos, com tipos `text`, `rating`, `number` e `notes`. A definição contém apenas rótulos e limites de entrada, sem valores de personagens.

O editor permite alterar texto, área, categoria interna, edição e citação; aceita `.txt`/`.md` como **texto simples**, sem interpretar HTML ou Markdown. Para publicar:

1. Edite e clique em **Salvar seção**.
2. **Exporte o acervo JSON**.
3. Substitua `src/content.json` pelo arquivo exportado.
4. Faça commit e push. O próximo deploy publica para todos.

O editor salva apenas no navegador. Não altera o GitHub, não envia PDFs nem publica automaticamente. Não há banco de dados ou autenticação nesta versão. Importações usam o esquema v2 e rejeitam formatos incompatíveis. Os sistemas do acervo importado são limitados aos definidos no catálogo publicado.

## Fichas locais

Cada sistema tem uma ficha que começa em branco/zero. É um formulário manual: não valida distribuição inicial, custos de experiência, poderes, combinações de magia ou regras de dano. Permite salvar neste navegador, importar/exportar JSON do mesmo sistema/edição e imprimir/salvar em PDF pelo navegador.

A ficha local não é enviada ao site público e não faz parte da exportação do acervo. Exporte uma cópia para preservar seu trabalho; limpar os dados do navegador pode removê-la. Dados preenchidos por você estarão no JSON de ficha exportado.

Chaves de armazenamento:

- `arquivo-trevas-content-v2`: rascunho do acervo.
- `arquivo-trevas-favorites-v1`: favoritos.
- `arquivo-trevas-sheet-v1-<sistema>`: ficha local.

A chave antiga `arquivo-trevas-content-v1` não é apagada, mas não substitui os documentos desta versão. Para voltar ao acervo publicado, remova apenas `arquivo-trevas-content-v2` no armazenamento do navegador. Isso não remove fichas ou favoritos.

## Publicar na Vercel

Importe o repositório e use:

- Framework: **Vite**.
- Build: **`npm run build`**.
- Diretório de saída: **`dist`**.

`vercel.json` já define esses parâmetros. Não são necessárias variáveis de ambiente. As rotas usam fragmentos, então links diretos funcionam na hospedagem estática sem redirecionamentos adicionais. Fontes tipográficas são servidas junto ao site.

Projeto independente de fãs, sem vínculo oficial com World of Darkness, Paradox Interactive ou editoras. Marcas e títulos pertencem aos respectivos titulares.
