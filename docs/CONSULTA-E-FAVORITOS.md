# Ferramentas de consulta

O cabeçalho mantém uma prévia de até cinco resultados. “Ver todos os resultados” e Enter abrem `#/busca?q=...`, com filtros por sistema, área, categoria interna e edição. A lista completa mostra 20 resultados por página, mantém os filtros nos links e pode ser compartilhada. A busca dentro de um sistema começa limitada àquele sistema; o visitante pode mudar o filtro na página completa.

Os poderes têm uma ficha de consulta com família, nível/tipo, efeito, teste, custo, resistência/oposição, duração e requisitos, acompanhada da resolução e da fonte. Os valores explícitos do acervo têm prioridade. Quando o campo de custo, duração ou resistência está vazio, apenas frases correspondentes do texto da própria regra podem ser citadas, identificadas como trechos. Na ausência delas, a ficha aponta para a resolução/fonte: não presume custo zero, ausência de oposição ou ativação automática. As progressões por nível também destacam teste, custo e duração. Os dados originais de `content.json` permanecem integrais.

## Favoritos e coleções pessoais

A estrela do cabeçalho abre `#/favoritos`. É possível salvar sistemas, áreas, tópicos, índices, poderes e páginas do leitor de documentos; os resultados da busca também oferecem “Salvar”. Depois de salvar, “Coleções” permite marcar uma ou mais pastas pessoais. A página de favoritos permite criar, renomear e excluir coleções. Excluir uma coleção preserva os itens em todos os favoritos e nas outras coleções. “Sem coleção” mostra referências que ainda não foram organizadas.

Os sistemas salvos em `arquivo-trevas-favorites-v1` são recuperados automaticamente quando ainda não existe o armazenamento novo. Novas ações mantêm a lista antiga de IDs de sistemas sincronizada para compatibilidade. A estrutura nova fica em `arquivo-trevas-library-v1`, versão 1, com referências públicas, coleções e seus vínculos. Os nomes são tratados como texto, limitados a 60 caracteres; é possível ter até 50 coleções. Nenhum desses controles edita o acervo publicado.

## Histórico

A home mostra até seis consultas recentes e um link para `#/recentes`, também acessível no rodapé e no menu móvel. O histórico conserva as últimas 40 referências distintas, movendo uma revisita para o topo. A lista pode ser limpa. Apenas páginas públicas efetivamente abertas e válidas entram nela; termos de busca, rascunhos e valores de fichas não entram. Abrir uma busca, um endereço inválido, favoritos ou o próprio histórico não cria uma visita.

`arquivo-trevas-recent-v1` guarda referência e horário apenas no navegador. Os dados de favoritos, coleções e histórico são sincronizados entre abas do mesmo navegador por eventos de armazenamento. Se o navegador bloquear o armazenamento, as ações funcionam em memória e um aviso informa a limitação. Isso não altera as chaves ou o formato das fichas.

## Carregamento

`src/content.json` continua sendo a fonte de edição do acervo. `scripts/build-archive.mjs`, executado antes de `npm run dev` e `npm run build`, gera:

- `src/generated/catalog.json`: metadados leves, contagem e URLs dos arquivos de cada sistema; sem textos de tópicos ou fichas.
- `public/data/archive/`: um JSON completo por sistema e um índice de busca por sistema, com nomes derivados do hash do conteúdo.
- `src/generated/analytics-routes.json`: lista de rotas públicas para a integração opcional de estatísticas, carregada somente após consentimento.

Os arquivos gerados não são versionados. Reinicie `npm run dev` após editar o conteúdo para regenerá-los. O deploy da Vercel usa `npm run build` e faz isso automaticamente. A home não baixa esses JSONs de sistemas ou busca; abrir um sistema busca somente o seu conteúdo. Digitar uma busca baixa os índices necessários ao escopo. As promessas são reutilizadas em memória e falhas permitem nova tentativa. O código do leitor e das fichas também é carregado ao abrir um sistema. As URLs com hash permitem cache público imutável e recebem uma nova versão quando o conteúdo muda.

O índice evita repetir palavras do corpo de uma entrada, preservando o ranking que considera os termos individualmente. Títulos e contexto continuam disponíveis e as prévias têm até 280 caracteres. Os PDFs e suas transcrições conservam seu carregamento por demanda e sua pesquisa própria.

Os termos da busca e os nomes de coleções não são enviados às estatísticas. As páginas de favoritos/histórico podem ser contadas por seus endereços genéricos; o conteúdo pessoal continua local. Nenhum novo evento de conteúdo privado foi adicionado.


## Verificação desta implementação

Foram aprovados 56 testes automatizados e a compilação de produção. A navegação foi conferida em Chromium nas larguras 320, 390, 768 e 1440 px: sugestões, página completa, paginação, filtros combinados, escopo por sistema, migração dos favoritos, coleções, exclusão sem perder itens, sincronização entre abas, persistência de uma ficha antiga e limpeza do histórico após recarga. Os cinco formulários conservaram seus 354 campos e duas páginas A4 quando vazios.

A inspeção de rede confirmou ausência de requisições de conteúdo/índices na home e carregamento de um único sistema/índice no escopo individual. Falhas de rede foram simuladas para testar a nova tentativa, assim como armazenamento bloqueado para conferir ações em memória. Uma simulação do coletor de estatísticas validou consentimento, rotas, descarte de buscas e nomes de coleções e retirada do aceite sem apagar dados locais; não comprova ingestão real no painel Vercel.
