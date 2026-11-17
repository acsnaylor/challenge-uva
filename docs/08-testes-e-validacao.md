# Testes e validação

## Estratégia

A verificação combina testes de componentes React, testes de serviços com banco relacional, um teste de integração PostgreSQL e scripts de chamadas HTTP. Cada camada possui limites próprios. Os testes da interface simulam o cliente de serviço e não devem ser descritos como testes completos de navegador contra a API publicada.

## Verificação executada nesta revisão

As verificações foram executadas em 17 de novembro de 2026, durante a revisão da documentação, sem alterar o código funcional.

| Verificação | Resultado |
| --- | --- |
| `dotnet test backend/ChallengeUva.Api.sln --configuration Release` | 37 aprovados, 1 ignorado e nenhuma falha |
| `npm test -- --runInBand` em `frontend` | 23 aprovados em 6 suítes |
| `npm run test:render` em `frontend` | 3 aprovados |
| `npm run build` em `frontend` | Compilação TypeScript e build Vite concluídos |
| GET do site publicado | HTTP 200 |
| GET de `/health` na API publicada | HTTP 200 com corpo `Healthy` |

O teste PostgreSQL foi ignorado nesta execução porque `TEST_POSTGRES_CONNECTION` não estava definida. Essa condição é declarada no próprio atributo de teste. Não é correto apresentar essa execução como 38 testes aprovados.

Na etapa anterior de preparação da publicação, o [registro no README](../README.md) documenta 38 testes do back-end aprovados com PostgreSQL real disponível, além dos testes HTTP em ambos os bancos e da persistência após reiniciar a API. Esse é um registro histórico daquela etapa, distinto da execução atual. A construção local da imagem Docker não foi realizada por indisponibilidade do Docker, embora `dotnet publish` tenha sido validado naquela preparação.

## Cobertura das suítes

| Arquivo | Casos | Comportamento verificado |
| --- | --- | --- |
| [ShopServiceTests.cs](../backend/ChallengeUva.Tests/ShopServiceTests.cs) | 19 | Produtos, preços e imagem; quantidades e persistência; pedido, recusa, repetição, mudança de preço, dados inválidos e concorrência |
| [ContactServiceTests.cs](../backend/ChallengeUva.Tests/ContactServiceTests.cs) | 12 | Persistência do contato, normalização, campos inválidos e limites; migration sem perda de produto anterior |
| [PostgresConfigurationTests.cs](../backend/ChallengeUva.Tests/PostgresConfigurationTests.cs) | 6 | Conversão de conexão, caracteres escapados, ausência de credenciais nas mensagens de erro e separação das migrations |
| [PostgresIntegrationTests.cs](../backend/ChallengeUva.Tests/PostgresIntegrationTests.cs) | 1 condicional | Migration e fluxo comercial com persistência em PostgreSQL real, incluindo contato e recusa |
| [Store.test.tsx](../frontend/src/__tests__/Store.test.tsx) | 8 | Vitrine e busca, inclusão e alteração de carrinho, cadastro de produto, checkout, campos obrigatórios e histórico |
| [Forms.test.tsx](../frontend/src/__tests__/Forms.test.tsx) | 3 | Digitação e colagem com máscaras, envio apenas de dígitos e telefone de dez dígitos |
| [Toast.test.tsx](../frontend/src/__tests__/Toast.test.tsx) | 4 | Diferenciação, deduplicação, fechamento e pausa do tempo por mouse ou foco |
| [PaymentFlow.test.tsx](../frontend/src/__tests__/PaymentFlow.test.tsx) | 3 | Página de recusa, carrinho preservado, aprovação e distinção de erro de conexão |
| [ContactPage.test.tsx](../frontend/src/__tests__/ContactPage.test.tsx) | 4 | Campos obrigatórios, protocolo após resposta, bloqueio de envio simultâneo e preservação em falha |
| [CustomerReviews.test.tsx](../frontend/src/__tests__/CustomerReviews.test.tsx) | 1 | Conteúdo fictício identificado, nomes, comentários e notas acessíveis |
| [validate-render-env.test.mjs](../frontend/scripts/validate-render-env.test.mjs) | 3 | URL HTTPS da API e rejeição de configuração ausente, local ou inadequada para publicação |

As quantidades incluem os casos parametrizados do xUnit. Os serviços SQLite utilizam conexão real em memória e aplicam migrations, sem substituir a persistência por mocks.

## Testes HTTP disponíveis

[smoke-test.mjs](../scripts/smoke-test.mjs) realiza cadastro de produto, alterações de carrinho, cadastro de cliente, validações de entrega, recusa, aprovação, repetição da finalização, desativação do produto e leitura do pedido. Uma segunda forma de execução consulta o pedido pelo identificador após reiniciar a API.

[contact-smoke-test.mjs](../scripts/contact-smoke-test.mjs) verifica entradas inválidas e recebimento válido com protocolo. Esses scripts criam dados. Não foram executados contra a aplicação publicada durante esta revisão documental, para não acrescentar registros sem necessidade.

## Roteiro manual de aceitação

| Cenário | Procedimento | Resultado a observar |
| --- | --- | --- |
| Catálogo | Buscar um sabor existente e depois um texto sem correspondência | Lista filtrada e mensagem de nenhum resultado |
| Produto | Cadastrar, editar e retirar um cupcake demonstrativo | Alteração refletida na vitrine e retirada sem apagar pedidos anteriores |
| Carrinho | Adicionar itens, mudar quantidades e atualizar a página | Total atualizado e itens recuperados |
| Formulários | Digitar e colar telefone e CEP; tentar campos incompletos | Máscaras, asteriscos e bloqueio de dados inválidos |
| Toasts | Salvar um produto, fechar o aviso e manter foco ou mouse sobre outra notificação | Mensagens diferenciadas, fechamento e pausa de expiração |
| Recusa | Concluir um checkout com a opção recusada e voltar ao carrinho | Página explicativa, itens preservados e ausência de pedido aprovado |
| Aprovação | Repetir o checkout com aprovação e consultar Meus pedidos | Pedido salvo com itens, total e endereço |
| Contato | Enviar dados fictícios válidos e testar campos vazios | Validação e confirmação com protocolo |
| Depoimentos | Ler os cartões e reduzir a janela | Identificação de exemplos fictícios e grade adaptada |
| Rotas publicadas | Abrir diretamente `/contact` e `/cart` | Carregamento da aplicação com a regra de reescrita do site |

O roteiro descreve uma verificação a executar e não um relatório de resultados de participantes. A consulta HTTP feita nesta revisão não valida interação visual, responsividade ou todos os fluxos em produção.

## Como reproduzir

Na raiz do repositório, execute os testes do back-end. Na pasta `frontend`, execute os testes da interface, a verificação do ambiente de build e o build.

```powershell
dotnet test backend/ChallengeUva.Api.sln --configuration Release
cd frontend
npm test -- --runInBand
npm run test:render
npm run build
```

Para incluir o teste PostgreSQL, configure `TEST_POSTGRES_CONNECTION` no terminal com uma conexão real de banco exclusivo de testes. O teste cria um schema aleatório, aplica as migrations e remove esse schema ao finalizar. Não utilize o banco publicado da entrega acadêmica.

## Limites da avaliação

Não há registro no repositório de quantidade de participantes, formulários de resposta, tempos de tarefa, índices de satisfação, auditoria de acessibilidade, teste de carga ou avaliação de segurança. Os cinco ajustes de usabilidade possuem evidência no código e no histórico Git, mas não permitem produzir estatísticas de melhoria.

Os testes automatizados reduzem o risco de regressão nos cenários cobertos. Eles não comprovam ausência de defeitos, disponibilidade contínua do serviço ou proteção de uma aplicação comercial sem autenticação.
