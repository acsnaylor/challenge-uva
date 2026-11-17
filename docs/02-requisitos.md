# Requisitos do sistema

Os requisitos abaixo descrevem o comportamento encontrado na implementação. Os identificadores foram criados para esta revisão e permitem relacionar necessidades, histórias, backlog e testes.

## Requisitos funcionais

| Código | Requisito | Evidência na implementação |
| --- | --- | --- |
| RF01 | Exibir produtos ativos com nome, descrição, preço e imagem | `Storefront` e `ShopService.Products` |
| RF02 | Buscar produtos por texto no nome ou na descrição | Filtragem da lista carregada em `Storefront` |
| RF03 | Cadastrar e editar produtos | `AdminPage`, POST e PUT de `/api/products` |
| RF04 | Retirar um produto da vitrine preservando seu registro | `DeleteProduct` define `IsActive = false` |
| RF05 | Adicionar produtos ativos a um carrinho | `ShopContext` e `SetQuantity` |
| RF06 | Alterar quantidades e remover itens do carrinho | PUT de itens, com quantidade zero para remoção |
| RF07 | Recuperar o carrinho ao recarregar a aplicação | Identificador local e GET de carrinho na API |
| RF08 | Cadastrar ou atualizar o cliente associado ao carrinho | `RegisterCustomer` durante o checkout |
| RF09 | Receber e validar as informações de entrega | Campos de `CheckoutRequest` |
| RF10 | Simular aprovação ou recusa de pagamento | `PaymentSimulation` aceita `approved` e `declined` |
| RF11 | Registrar um pedido aprovado com dados históricos da compra | `Checkout` e entidades `Order` e `OrderItem` |
| RF12 | Apresentar página de recusa com retorno ao carrinho | `/payment-failed` e `PaymentFailedPage` |
| RF13 | Consultar pedidos a partir dos identificadores disponíveis no navegador | `OrdersPage` e GET de pedido por carrinho |
| RF14 | Receber uma mensagem de contato e confirmar com protocolo | `ContactPage`, `ContactService` e `ContactMessageReceipt` |
| RF15 | Comunicar sucessos e erros operacionais por toast | `ToastProvider` e chamadas nas páginas |
| RF16 | Exibir depoimentos fictícios identificados como exemplos | `CustomerReviews`, com três registros estáticos |

Todos os requisitos desta tabela estão implementados dentro dos limites descritos. RF08 não inclui login e RF13 não oferece uma conta com histórico sincronizado entre dispositivos. RF16 não permite cadastrar ou moderar avaliações.

## Requisitos não funcionais

| Código | Aspecto | Situação observada e limite |
| --- | --- | --- |
| RNF01 | Usabilidade dos formulários | Máscaras de telefone e CEP, asteriscos e manutenção das validações |
| RNF02 | Adaptação visual | Grades e navegação com regras CSS para diferentes larguras; sem relatório formal de compatibilidade entre dispositivos |
| RNF03 | Acessibilidade das mensagens | Toasts com papéis `status` ou `alert`, fechamento por botão e pausa por foco ou mouse; sem auditoria de conformidade completa |
| RNF04 | Persistência | Dados comerciais no banco, SQLite local e configuração PostgreSQL em produção; `localStorage` guarda identificadores |
| RNF05 | Integridade da compra | Total calculado no servidor, transação de finalização, revisão do carrinho e unicidade de pedido por carrinho |
| RNF06 | Manutenibilidade | Separação em domínio, aplicação, infraestrutura, API e interface, com testes e migrations versionadas |
| RNF07 | Configuração de ambientes | URL da API por variável Vite, banco e CORS configuráveis e execução da API por Docker |
| RNF08 | Tratamento de falhas | Respostas HTTP de validação e negócio; erros inesperados registrados no servidor com mensagem genérica ao cliente |
| RNF09 | Observabilidade básica | Swagger para os contratos e `/health` para verificar conectividade com o banco |
| RNF10 | Segurança de acesso | Parcial. CORS restrito e configuração de credenciais no servidor; não há autenticação ou autorização administrativa |

Não há meta documentada de tempo de resposta, número de usuários simultâneos ou disponibilidade contínua. A existência de testes funcionais e de um endpoint saudável não comprova desempenho sob carga nem segurança completa.

## Regras de negócio e validações

| Código | Regra |
| --- | --- |
| RB01 | Produto exige nome de 2 a 100 caracteres e descrição de 10 a 1000 caracteres |
| RB02 | Preço deve estar entre R$ 0,01 e R$ 9.999,99, com até duas casas decimais |
| RB03 | Imagem deve utilizar URL HTTP/HTTPS ou caminho iniciado por `/images/`; não existe upload |
| RB04 | A inclusão de item exige produto existente e ativo. A vitrine mostra apenas produtos ativos |
| RB05 | Um item do carrinho possui de 1 a 99 unidades. Enviar quantidade zero remove o item |
| RB06 | Cliente exige nome de 2 a 100 caracteres, e-mail válido e telefone de 10 ou 11 dígitos |
| RB07 | O e-mail do cliente é normalizado e único. Outro carrinho não pode assumir um cadastro apenas informando o mesmo e-mail |
| RB08 | Um novo carrinho pode reutilizar o cliente quando recebe o identificador de um carrinho anterior |
| RB09 | Entrega exige CEP, rua, número, bairro, cidade e UF válida; complemento é opcional. O frete da demonstração é zero |
| RB10 | O navegador envia telefone e CEP sem pontuação. A API aceita telefone somente com dígitos e CEP com oito dígitos ou hífen no formato previsto |
| RB11 | A finalização exige cliente e ao menos um item disponível, além de coincidência entre `ExpectedTotal` e o total calculado no servidor |
| RB12 | Uma recusa retorna HTTP 422 e não cria pedido nem fecha o carrinho. O cadastro do cliente, realizado antes, pode já ter sido salvo |
| RB13 | Uma aprovação grava o pedido e fecha o carrinho na mesma chamada a `SaveChangesAsync`, com transação do EF Core |
| RB14 | Um carrinho concluído não pode ter seus itens modificados. Uma nova finalização válida desse carrinho devolve o pedido existente |
| RB15 | Nome e preço dos itens e dados do cliente são copiados para o pedido, preservando o histórico após alterações no catálogo ou cadastro |
| RB16 | Contato exige nome de 2 a 100 caracteres, e-mail de até 254, assunto de até 150 e mensagem de até 3000 caracteres, sem campos obrigatórios vazios |
| RB17 | A confirmação de contato é emitida após a gravação e utiliza o identificador da mensagem como protocolo |
| RB18 | Toasts idênticos da mesma categoria não são duplicados enquanto estiverem visíveis. O tempo mínimo é de 8 segundos, ou 12 segundos para erros |

O endereço é recebido no checkout e gravado no pedido aprovado. Não existe cadastro separado de endereços nem persistência de rascunho de entrega ao sair da página.

## Fontes

- [Contratos de compra e produtos](../backend/ChallengeUva.Domain/Requests/ShopRequests.cs)
- [Contrato de contato](../backend/ChallengeUva.Domain/Requests/ContactMessageRequest.cs)
- [Regras da loja](../backend/ChallengeUva.Application/Services/ShopService.cs)
- [Recebimento de contato](../backend/ChallengeUva.Application/Services/ContactService.cs)
- [Máscaras](../frontend/src/components/ui/MaskedInput.tsx) e [toasts](../frontend/src/components/ui/toast.tsx)
