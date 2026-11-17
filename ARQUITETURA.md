# Arquitetura da loja de cupcakes

## Análise e reaproveitamento

A documentação acadêmica atualizada está em [docs](docs/README.md), com requisitos, histórias, backlog, modelos e comparação entre a PIT I e a PIT II. Este arquivo mantém a visão técnica resumida do repositório.

O projeto original já separava domínio, aplicação, infraestrutura e API. O front-end usava React Router, Axios, React Hook Form, Tailwind e componentes reutilizáveis. Foram preservados os projetos C# e seus nomes para reduzir alterações estruturais e manter referências da solução.

| Elemento existente | Uso na loja |
| --- | --- |
| React, TypeScript e Vite | Aplicação e build preservados |
| Tailwind e componentes Button/Input/ImageWithFallback | Formulários, ações, imagens e interface responsiva |
| React Router / AppLayout | Rotas da loja, navegação e cabeçalho com quantidade do carrinho |
| Axios / apiClient | Integração HTTP real, configurável por variável de ambiente |
| React Hook Form | Cadastro de produtos e checkout |
| ASP.NET Core / Startup / controllers / DI | Inicialização, endpoints e injeção do serviço da loja |
| Entity Framework / ChallengeUvaContext / SQLite | Persistência e migrations incrementais |
| Repositório genérico | Preservado; o serviço transacional usa diretamente o DbContext compartilhado |
| xUnit, FluentAssertions, Jest e Testing Library | Suítes adaptadas ao domínio da loja |

Telas, serviços e controllers de heróis foram substituídos. Entidades e mapeamentos históricos continuam no contexto exclusivamente para compatibilidade com as migrations e bancos antigos. Não são expostos pela API. A migration GourmetShop adiciona as tabelas comerciais sem eliminar registros anteriores.

## Camadas

- `ChallengeUva.Domain`: entidades de produto, cliente, carrinho e pedido; contratos de entrada com validações.
- `ChallengeUva.Application`: `ShopService` e regras de negócio, totalização, validação e finalização.
- `ChallengeUva.Infrastructure`: DbContext, configuração relacional, migrations e infraestrutura de repositório existente.
- `ChallengeUva.Api`: controllers finos, CORS, Swagger e tratamento centralizado de erros.
- `frontend/src/services/shop.ts`: contratos TypeScript e chamadas HTTP.
- `frontend/src/app/ShopContext.tsx`: recuperação do carrinho, identificação local e coordenação das alterações.
- `frontend/src/pages/Store`: vitrine, gestão de produtos, carrinho, checkout e histórico.

O serviço usa a unidade de trabalho do EF diretamente porque a finalização precisa salvar o agregado de pedido e a alteração do carrinho na mesma transação. Evita chamadas separadas a repositórios que poderiam gravar um pedido sem fechar seu carrinho.

## Modelo de dados

`Product` armazena nome, descrição, preço, imagem e disponibilidade. A remoção é lógica para não invalidar referências de carrinhos e o histórico.

`Customer` armazena nome, e-mail normalizado e telefone. Um e-mail possui índice único. A operação de cadastro pertence ao carrinho e pode atualizar seu cliente atual. Um novo carrinho pode reutilizar o cliente de um carrinho anterior mediante apresentação do identificador aleatório anterior.

`Cart` possui identificador UUID, cliente opcional, estado de finalização, revisão e itens. Cada par carrinho/produto é único. Quantidades variam de 1 a 99; enviar zero remove o item. O servidor sempre consulta os produtos para calcular preços e totais.

`Order` guarda os dados do cliente e da entrega na compra, data UTC, resultado do pagamento simulado, total e itens. `OrderItem` copia nome, preço e quantidade; alterações posteriores no produto ou no cadastro não reescrevem o pedido. O vínculo ao carrinho é único.

Valores monetários são `decimal` no domínio e inteiros em centavos no SQLite, evitando cálculos com ponto flutuante na persistência.

## Consistência e erros

- Uma única chamada `SaveChangesAsync` grava pedido e finalização do carrinho atomicamente.
- A revisão do carrinho é um token de concorrência otimista; duas alterações sobre a mesma revisão não podem ser gravadas silenciosamente.
- O índice único de pedido por carrinho reforça a proteção contra duplicidade. Uma repetição após conclusão devolve o pedido existente.
- O checkout recusa carrinho vazio, cliente ausente, produto desativado, endereço inválido ou divergência de preço.
- O pagamento recusado não grava pedido nem finaliza o carrinho. A simulação não recebe dados financeiros.
- Conflitos retornam HTTP 409; dados inválidos, 400; registros ausentes, 404; pagamento recusado, 422. Falhas inesperadas retornam mensagem genérica e são registradas no servidor.
- O front-end impede ações repetidas durante requisições, exibe falhas e atualiza o carrinho após conflitos no checkout, preservando o preenchimento do formulário.

## Bancos e publicação

O ambiente Development mantém `ChallengeUvaContext` com SQLite e o histórico de migrations existente. Em Production, `appsettings.Production.json` seleciona PostgreSQL, configurado por `DATABASE_URL` ou `ConnectionStrings__Postgres`. A inicialização não utiliza SQLite como fallback se a conexão de produção estiver ausente.

`PostgresChallengeUvaContext` herda o mesmo modelo e possui migrations próprias em `Data/Migrations/PostgreSQL`. A DI entrega esse contexto como `ChallengeUvaContext` aos serviços e repositórios existentes, mantendo as operações e suas transações. A separação impede executar as migrations específicas do SQLite no PostgreSQL. Valores monetários continuam em centavos, armazenados como `bigint` no PostgreSQL, e as datas de pedido e contato utilizam UTC.

O Dockerfile publica a API em múltiplos estágios e utiliza somente o runtime ASP.NET Core na imagem final, com usuário sem privilégios de administrador. O programa lê `PORT` e escuta em `0.0.0.0` quando essa variável existe; os perfis locais permanecem iguais. `/health` verifica a conexão com o banco. As migrations são aplicadas na inicialização da instância da demonstração.

O front-end é um Static Site separado. `VITE_API_BASE_URL` contém a origem HTTPS pública da API no momento do build, validada por `npm run build:render`. A API autoriza a origem real do front-end por `AllowedOrigins__0`, sem origem curinga. A reescrita das rotas React para `/index.html` é configurada no Render. As instruções completas e os valores que precisam ser obtidos no painel estão no README.

## Identificação e limites

Os dados comerciais ficam na API. `localStorage` contém apenas identificadores opacos para recuperar o carrinho, reutilizar o cadastro e consultar pedidos. Não existe cópia local de produtos ou pedidos como substituto do back-end.

A demonstração publicada não implementa contas autenticadas nem privilégios de administrador. O UUID do carrinho dá acesso aos dados associados. A gestão de produtos permanece pública. O uso operacional com dados reais requer autenticação e autorização, incluindo recuperação de conta e acesso entre dispositivos.

As imagens fornecidas são ilustrações SVG locais, reaproveitando o suporte a assets do Vite. O catálogo permite outras imagens por URL. Frete gratuito, pagamento simulado e ausência de estoque são limites deliberados do projeto.
