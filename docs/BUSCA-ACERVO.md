# Busca de conteúdo no cabeçalho

O campo “Buscar no acervo” pesquisa tópicos, índices de categorias, poderes e suas regras. Cada resultado identifica o sistema e a edição, o assunto, uma prévia e o endereço direto. A lista apresenta no máximo cinco correspondências; não completa vagas com itens sem correspondência.

Na home, contato e páginas gerais, a pesquisa abrange todos os sistemas publicados. Em qualquer página de um sistema, inclusive lore, mecânica, ficha e documentos, o campo pesquisa somente os conteúdos desse sistema e indica o escopo. Digitar não muda a página; escolher um resultado abre seu destino. A troca de endereço fecha a lista e limpa o termo.

Exemplo: `artes` na home retorna primeiro o índice **Artes — Changeling 20A**, que abre os 19 tópicos. `Talecraft` pode retornar menos de cinco itens. Pesquisar esse termo em Caçador não retorna conteúdos de Changeling.

O índice em `src/archive-search.js` deriva automaticamente de `content.json`; novos sistemas e tópicos passam a participar da busca sem uma lista fixa de sistemas. Títulos exatos e índices têm prioridade sobre ocorrências no texto. Todos os termos precisam corresponder. A busca ignora acentos, diferenças entre maiúsculas e minúsculas e pontuação, e inclui paradas, custos e orientações de rolagem. Não indexa valores preenchidos de personagens nem dados do navegador. As páginas integrais dos PDFs têm sua própria pesquisa no leitor de documentos; o cabeçalho usa o conteúdo organizado nos tópicos do acervo.

`src/ArchiveSearch.jsx` apresenta a lista no cabeçalho, com links nativos. Ctrl/Cmd+K foca a busca, setas percorrem resultados, Enter abre um destino e Escape fecha a lista. Também é possível limpar o termo ou clicar fora para fechar. A lista se adapta à largura da tela e rola internamente quando necessário.

Validação: 41 testes automatizados aprovados, compilação de produção e navegação em navegador nas larguras 320, 390, 768 e 1440 px. Os testes cobrem priorização de Artes, limite, ausência de correspondências, identificação dos sistemas, isolamento de escopo, normalização e validade de todos os destinos gerados.
