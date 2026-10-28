# Arquivo das Trevas

Base de um acervo independente sobre os sistemas do Mundo das Trevas, em português. Feita com React e Vite, pronta para hospedagem estática na Vercel.

## Desenvolvimento

Requer Node.js 22.12+ (ou Node.js 24 LTS) e npm.

```sh
npm ci
npm run dev
```

Para gerar e conferir a versão de produção:

```sh
npm run build
npm run preview
```

## O que já funciona

- Catálogo de cinco sistemas: Vampiro, Changeling, Caçador, Mago e Aparição, com apresentação e símbolos geométricos próprios.
- Busca por nome ou tema, filtro por edição e favoritos locais.
- Página de cada sistema com visão geral, criação de personagem, regras, poderes, cenário e referências.
- Layout responsivo e navegação por teclado.
- Editor de seções, importação de textos `.txt`/`.md`, importação e exportação de acervo JSON.
- Fontes servidas junto do site, sem dependência de Google Fonts.

Os textos das seções são demonstrativos. As edições listadas são opções de organização; não significam que já existam regras cadastradas para cada uma. A página de uma seção mostra sua própria edição e fonte. Não misture regras de edições diferentes sem identificação.

## Adicionar informações

### Editar o projeto diretamente

O acervo inteiro fica em **`src/content.json`**. Cada sistema tem:

- `id`: identificador único, em letras minúsculas, números e hífens; usado no endereço.
- `name`, `subtitle`, `original`, `description`, `year`, `theme`: apresentação.
- `kind`: aparência do cartão (`vampire`, `mage`, `ghost`, `fae`, `hunter`).
- `editions`: edições que aparecem no filtro.
- `sections`: seções com `id`, `title`, `intro`, `body`, `edition` e `source` (livro/página).

Adicione seções com IDs únicos dentro do sistema. O catálogo usa os cinco sistemas definidos neste arquivo. Ao carregar rascunhos antigos ou importar JSON, o site conserva apenas esses sistemas, preservando seus textos editados; sistemas ausentes recebem o conteúdo padrão. As seções aceitam texto simples e quebras de linha; HTML e Markdown não são interpretados.

### Usar o editor do site

1. Abra **Gerenciar conteúdo**.
2. Escolha sistema e seção; cole um texto ou carregue `.txt`/`.md`.
3. Indique edição e fonte e clique em **Salvar seção**.
4. Clique em **Exportar acervo JSON**.
5. Substitua `src/content.json` pelo arquivo exportado, faça commit/push e publique um novo deploy.

**Salvar no editor guarda apenas um rascunho no armazenamento desse navegador.** Não altera o repositório, não envia documentos a um servidor e não publica para outros visitantes. Não existe autenticação, backend, banco de dados ou biblioteca de PDFs nesta versão. O editor é uma ferramenta local de preparação, acessível a qualquer visitante; ninguém consegue alterar o conteúdo público por ele.

A opção **Importar acervo JSON** substitui o rascunho local pelo arquivo selecionado. Exporte uma cópia antes de importar se quiser preservar seu trabalho. Os favoritos também ficam no navegador. Para voltar a visualizar os dados publicados, remova a chave `arquivo-trevas-content-v1` no armazenamento local do site nas ferramentas do navegador. Não guarde dados confidenciais no editor.

## Publicar na Vercel

1. Envie este projeto para seu repositório no GitHub.
2. Na Vercel, escolha **Add New → Project** e importe o repositório.
3. Selecione o framework **Vite**, comando de build `npm run build` e saída `dist`.
4. Clique em **Deploy**. Não são necessárias variáveis de ambiente.

O arquivo `vercel.json` já define esses parâmetros. Depois, cada push na branch conectada dispara um novo deploy conforme a configuração da Vercel. A navegação usa fragmentos (`#/sistema/vampiro`), de modo que links diretos funcionam na hospedagem estática sem regras de redirecionamento.

## Estrutura

```text
src/
  main.jsx       Interface, navegação, busca, favoritos e editor
  styles.css     Tema e layout responsivo
  content.json   Acervo editável
public/
  favicon.svg    Ícone próprio
vercel.json      Configuração da hospedagem
```

Projeto de fãs, sem vínculo oficial com World of Darkness, Paradox Interactive ou editoras. Marcas e títulos pertencem aos respectivos titulares. Use textos próprios e conteúdos cuja publicação seja permitida.
