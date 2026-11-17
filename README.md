# Doce Ateliê — Cupcakes Gourmet

Loja virtual acadêmica da disciplina **Projeto Integrador Transdisciplinar em Engenharia de Software II**, adaptada do projeto ChallengeUva.

## Melhorias de usabilidade — PIT II

A versão anterior às melhorias está no commit `87e3ef8`. Cada melhoria desta etapa é registrada em um commit separado para permitir a comparação no segundo vídeo.

1. **Formulários:** telefone com máscara `(XX) XXXXX-XXXX` (também aceita os telefones de dez dígitos já suportados), CEP `XXXXX-XXX` e asterisco nos campos obrigatórios de produtos e checkout. As máscaras são apenas visuais; telefone e CEP são enviados à API somente com dígitos, preservando as validações do servidor.

**Verificação manual:** abra Gerenciar produtos e confira os asteriscos. Adicione um cupcake ao carrinho e abra o checkout. Digite ou cole telefone e CEP; confira as máscaras, tente enviar dados incompletos e, na aba Network do navegador, confirme os valores sem pontuação nas requisições válidas. Complemento continua opcional.

2. **Notificações toast:** sucessos e erros aparecem no canto inferior direito, sem deslocar o conteúdo. Há texto e cores diferentes, anúncio para leitores de tela, fechamento manual e tempo mínimo de 8 segundos (12 para erros), com pausa por mouse ou foco do teclado. Mensagens idênticas já visíveis não são duplicadas.

**Verificação manual:** adicione um cupcake e salve/edite um produto para observar os toasts de sucesso. Para observar um erro, use uma URL inválida no cadastro de produto ou interrompa temporariamente a API e tente uma operação. Confira o botão de fechar e passe o mouse ou leve o foco do teclado à notificação para pausar seu desaparecimento. Reative a API antes de continuar.

3. **Pagamento recusado:** a resposta de recusa (HTTP 422) leva à página `/payment-failed`, com explicação e botão **Voltar ao carrinho**. A página recebe foco no título para leitores de tela. Os itens e quantidades permanecem no SQLite, nenhum pedido é aprovado e a aprovação continua no fluxo anterior. Outros erros permanecem no checkout e usam toast.

**Verificação manual:** preencha o checkout e selecione **Recusar pagamento (teste)**. Confirme a navegação para a página de falha, volte ao carrinho e confira as quantidades, inclusive após atualizar a página. Repita o checkout com **Aprovar pagamento** e verifique a confirmação e o histórico. No Swagger, a consulta do pedido do carrinho recusado retorna 404 até uma aprovação.

4. **Fale Conosco:** rota `/contact`, acessível pela navegação principal, com nome, e-mail, assunto e mensagem obrigatórios. O novo endpoint `POST /api/contact-messages` valida e grava os dados na tabela `ContactMessages` do SQLite. A confirmação usa toast com número de protocolo e só ocorre após a gravação. Em falhas, o preenchimento é preservado. Não há envio de e-mail nem listagem pública de mensagens.

**Verificação manual:** reinicie a API para carregar o endpoint e aplicar a migration `ContactMessages`. Abra Fale Conosco; tente enviar vazio e com e-mail inválido, depois envie dados fictícios válidos. Confira o toast com protocolo. O endpoint está no Swagger, e os registros podem ser consultados no SQLite com `SELECT Id, Name, Email, Subject, Message, CreatedAt FROM ContactMessages;`. Para um teste HTTP automatizado, execute `node scripts/contact-smoke-test.mjs http://localhost:5000` (cria uma mensagem de demonstração). Os testes do back-end também verificam a persistência em outro contexto SQLite e a atualização de um banco anterior sem perda dos produtos.

5. **Avaliações na home:** três depoimentos demonstrativos com nome fictício, estrelas e comentário, identificados no aviso da seção e em cada cartão. A grade tem três colunas em telas maiores e uma coluna no celular. As notas têm descrição acessível para leitores de tela. O conteúdo é estático, sem representar avaliações reais nem introduzir cadastro de avaliações.

**Verificação manual:** na vitrine, role até **Avaliações de clientes**, abaixo dos produtos. Confira o aviso de conteúdo fictício, os nomes, as notas e os comentários. Reduza a janela para aproximadamente 375 px e verifique a disposição dos cartões em uma coluna e o acesso à navegação.

## Arquivos das melhorias

| Melhoria | Arquivos principais |
| --- | --- |
| Formulários | `frontend/src/components/ui/MaskedInput.tsx`, `RequiredMark.tsx`, `pages/Store/CheckoutPage.tsx`, `AdminPage.tsx`, `styles/globals.css`, testes `Forms.test.tsx` e `Store.test.tsx` |
| Toasts | `frontend/src/components/ui/toast.tsx`, `app/App.tsx`, `ShopContext.tsx`, `components/layout/AppLayout.tsx`, páginas `Storefront`, `AdminPage`, `CheckoutPage`, `OrdersPage`, estilos e `Toast.test.tsx` |
| Pagamento recusado | `frontend/src/pages/Store/PaymentFailedPage.tsx`, `CheckoutPage.tsx`, `app/App.tsx`, estilos, `PaymentFlow.test.tsx` e `backend/ChallengeUva.Tests/ShopServiceTests.cs` |
| Fale Conosco | `frontend/src/pages/Store/ContactPage.tsx`, `services/shop.ts`, rotas, navegação e estilos; back-end `ContactMessage.cs`, `ContactMessageRequest.cs`, `ContactMessageReceipt.cs`, `ContactService.cs`, `ContactMessagesController.cs`, `Startup.cs`, contexto e migration `ContactMessages`; `ContactPage.test.tsx`, `ContactServiceTests.cs` e `scripts/contact-smoke-test.mjs` |
| Avaliações | `frontend/src/components/CustomerReviews.tsx`, `pages/Store/Storefront.tsx`, estilos, `CustomerReviews.test.tsx` e `Store.test.tsx` |

O README foi atualizado em cada um dos cinco commits. Para a comparação geral: `git diff 87e3ef8..HEAD`. Para ver os arquivos de uma melhoria: `git show --stat <commit>`.

**Validação desta etapa:** 31 testes do back-end e 23 do front-end aprovados; build de produção aprovado; testes HTTP de compra e contato aprovados contra uma API de teste; gravação da mensagem conferida diretamente no SQLite; modelo sem alterações pendentes de migration. As instruções acima são o roteiro para a revisão visual e a demonstração manual no navegador.

## Funcionalidades

- Vitrine com busca, nome, descrição, preço e imagens locais de cupcakes.
- Cadastro, edição e remoção de produtos pela tela **Gerenciar produtos**.
- Carrinho persistido na API, com alteração de quantidade e remoção de itens.
- Cadastro do cliente no checkout: nome, e-mail e telefone com DDD.
- Endereço de entrega com CEP, rua, número, bairro, cidade, UF e complemento.
- Pagamento simulado com aprovação ou recusa; nenhum dado de cartão é solicitado.
- Pedidos persistidos com histórico dos itens, preços, cliente e endereço no momento da compra.
- Validações no front-end e no servidor, tratamento de falhas e proteção contra finalização duplicada.

## Tecnologias e organização

React 18, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form e Axios no front-end. C# / ASP.NET Core 8, Entity Framework Core e SQLite no back-end. Veja [ARQUITETURA.md](ARQUITETURA.md) para as decisões e os componentes reaproveitados.

## Pré-requisitos

- .NET SDK 8 ou posterior, com runtime ASP.NET Core 8 instalado (`dotnet --list-runtimes`).
- Node.js 20.19+ ou 22.12+ e npm, conforme exigido pelo Vite 7.
- Dois terminais para manter API e front-end em execução.

Não é necessário instalar um servidor de banco de dados nem executar migrations manualmente.

## Executar

No primeiro terminal, a partir da raiz do repositório:

```powershell
dotnet restore backend/ChallengeUva.Api.sln
dotnet run --project backend/ChallengeUva.Api --launch-profile http
```

API: http://localhost:5000. Swagger: http://localhost:5000/swagger.

No segundo terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Abra http://localhost:5173. A porta 5173 deve estar disponível, pois é a origem CORS padrão autorizada.

O arquivo `frontend/.env.example` documenta `VITE_API_BASE_URL`. Para alterar a URL da API, copie-o para `frontend/.env.local`, ajuste o valor e reinicie o Vite. Para autorizar outra origem do front-end, configure o array `AllowedOrigins` em `backend/ChallengeUva.Api/appsettings.json`.

Para gerar o front-end de produção:

```powershell
cd frontend
npm run build
```

O resultado estará em `frontend/dist`. A API continua necessária; hospedar apenas o HTML não substitui o back-end.

## Persistência

SQLite é o padrão também no ambiente Development. O banco `backend/ChallengeUva.Api/challenge.db` é criado ao iniciar com os comandos acima. A conexão pode ser alterada em `ConnectionStrings:Default` ou na variável `ConnectionStrings__Default`.

As migrations são aplicadas na inicialização. Em um banco novo, a API cadastra quatro sabores de exemplo. Imagens ilustradas estão em `frontend/public/images`, sem dependência de serviços externos. Produtos também aceitam URLs de imagem HTTP/HTTPS. Não existe upload de arquivos nesta versão.

Produtos, clientes, carrinhos, itens e pedidos são armazenados no SQLite. O navegador guarda apenas os identificadores do carrinho atual, do cadastro anterior e dos pedidos. Recarregar a página ou reiniciar a API preserva os dados. Limpar o armazenamento do navegador perde os atalhos locais para esses registros; não apaga o banco.

O cadastro do cliente pode ser atualizado no checkout. Novas compras no mesmo navegador reaproveitam o cadastro anterior por meio do identificador de carrinho. E-mails são únicos. Em outro navegador, um e-mail já cadastrado requer acesso ao carrinho original; esta versão não inclui login ou recuperação de conta.

As tabelas antigas de heróis são mantidas para permitir atualizar bancos existentes sem apagar dados. Os endpoints e as telas antigos foram retirados. Os registros antigos não são convertidos em produtos.

## Roteiro de demonstração

1. Abra **Gerenciar produtos** e cadastre um cupcake usando `/images/morango.svg` ou uma URL HTTP/HTTPS de imagem.
2. Na vitrine, adicione produtos. Abra o carrinho e altere as quantidades.
3. Continue para entrega, preencha cliente e endereço.
4. Selecione **Recusar pagamento (teste)** e confirme: a API retorna uma recusa e a loja abre a página de falha, mantendo o carrinho.
5. Clique em **Voltar ao carrinho**, continue para o checkout e selecione **Aprovar pagamento**: o pedido é salvo e o carrinho é finalizado.
6. Consulte **Meus pedidos**, reinicie a API e recarregue a página para verificar a persistência.
7. Edite ou remova um produto: os dados dos pedidos anteriores permanecem iguais.

A entrega tem valor zero na demonstração. Não há cobrança, gateway ou entrega real.

## Testes

Na raiz:

```powershell
dotnet test backend/ChallengeUva.Api.sln
```

Os testes do back-end executam migrations e serviços contra SQLite real em memória, incluindo persistência entre contextos, preços, quantidades, cliente, entrega, recusa, concorrência e idempotência.

No front-end:

```powershell
cd frontend
npm test -- --runInBand
npm run build
```

Os testes React validam vitrine, busca, gerenciamento, carrinho, formulário, envio do checkout e histórico. O cliente de serviço é simulado nesses testes; o teste HTTP abaixo cobre a API real.

Com a API em execução, a partir da raiz:

```powershell
node scripts/smoke-test.mjs http://localhost:5000
```

Esse teste cria produto, cliente, carrinho e pedido, verifica códigos HTTP e simula recusa/aprovação. O produto de teste é desativado no final; cliente, carrinhos e pedido permanecem no banco. Use um banco de demonstração. O script imprime um `cartId`. Depois de reiniciar a API com o mesmo banco:

```powershell
node scripts/smoke-test.mjs http://localhost:5000 <cartId>
```

Substitua `<cartId>` pelo identificador impresso para confirmar que o pedido continua persistido.

## API

Respostas de sucesso retornam diretamente o recurso JSON; não usam o envelope antigo de heróis. Erros de negócio retornam `status` e `title`; validações HTTP incluem `errors` no formato Problem Details. O Swagger contém os contratos completos.

| Método | Endpoint | Comportamento |
| --- | --- | --- |
| GET | `/api/products` | Produtos ativos |
| GET | `/api/products/{id}` | Detalhes de um produto ativo |
| POST | `/api/products` | Criação (201) |
| PUT | `/api/products/{id}` | Edição |
| DELETE | `/api/products/{id}` | Desativação (204) |
| POST | `/api/carts` | Novo carrinho (201) |
| POST | `/api/carts?previousCartId={guid}` | Novo carrinho reutilizando o cliente anterior |
| GET | `/api/carts/{guid}` | Carrinho e total calculado pelo servidor |
| PUT | `/api/carts/{guid}/items/{productId}` | Corpo `{ "quantity": 2 }`; zero remove; máximo 99 |
| PUT | `/api/carts/{guid}/customer` | Cadastro/atualização do cliente desse carrinho |
| POST | `/api/carts/{guid}/checkout` | Endereço, `paymentSimulation` e `expectedTotal` |
| GET | `/api/carts/{guid}/order` | Pedido originado pelo carrinho |
| POST | `/api/contact-messages` | Recebe nome, e-mail, assunto e mensagem; grava no SQLite e retorna protocolo (201) |

`paymentSimulation` aceita `approved` ou `declined`. `expectedTotal` deve coincidir com o total calculado pelo servidor; divergências retornam 409 para revisão dos preços. A aprovação grava o pedido e fecha o carrinho em uma transação. Repetir a finalização válida retorna o mesmo pedido. A recusa retorna 422 e não cria pedido.

## Limites da versão acadêmica

Todos os requisitos de compra são implementados localmente. Para disponibilização pública, ainda são necessários autenticação e autorização administrativa, recuperação de conta e políticas de acesso aos dados. Os identificadores aleatórios de carrinho funcionam como chaves de acesso da demonstração e não devem ser compartilhados. O histórico local pertence ao navegador utilizado, sem sincronização entre dispositivos.

Não fazem parte desta versão: estoque, cálculo de frete, upload de imagens, rastreamento logístico e gateway real. O pagamento simulado e a entrega gratuita são decisões explícitas do escopo acadêmico.
