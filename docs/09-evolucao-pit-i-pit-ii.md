# Evolução da PIT I para a PIT II

## Documento de referência

A comparação utiliza o PDF `PIT_atividade (1).pdf`, fornecido pela autora durante esta revisão. O documento tem três páginas e apresenta a situação-problema escolhida, o objetivo, os conceitos utilizados, a metodologia, o tempo de planejamento, os procedimentos e a discussão do resultado.

Na página 1, a situação-problema descreve um aplicativo mobile para uma loja de cupcakes gourmet, com preocupação em organizar melhor os requisitos após dificuldades com um sistema anterior. Na página 2, o objetivo relaciona organização das funcionalidades, vendas online e experiência dos usuários. A metodologia é descrita como ágil, baseada em Scrum.

O documento informa 14 horas de planejamento, distribuídas entre análise, histórias, backlog, diagramas, wireframes e revisão. Esse tempo pertence à PIT I. Não há registro equivalente de esforço da PIT II no repositório, portanto não foi estimado um total para a implementação.

As páginas 2 e 3 mencionam cadastro, login, produtos, carrinho, pagamento e entrega. Também mencionam a elaboração de casos de uso e wireframes, mas não anexam suas imagens ou listas detalhadas. A comparação abaixo considera apenas o que está descrito, sem atribuir ao planejamento requisitos adicionais.

## Comparação de escopo

| Planejamento descrito na PIT I | Entrega observada na PIT II | Situação |
| --- | --- | --- |
| Aplicativo mobile | Aplicação web responsiva acessível pelo navegador | Adaptado; não existe aplicativo nativo ou PWA configurada |
| Organização dos requisitos e funcionalidades | Regras em contratos e serviços, com documentação rastreável ao código | Implementado e sistematizado nesta revisão |
| Histórias de usuário e backlog | Histórias e backlog atuais reconstruídos a partir do sistema | Atualizados; não são transcrição dos artefatos originais ausentes |
| Cadastro | Cliente cadastrado ou atualizado no checkout | Entregue para identificação da compra, sem conta autenticada |
| Login | Ausente na interface, nas entidades e nos endpoints ativos | Não implementado |
| Visualização de produtos | Vitrine com nome, imagem, descrição, preço e busca | Implementado |
| Carrinho de compras | Carrinho persistido com inclusão, quantidades e remoção | Implementado |
| Pagamento | Aprovação e recusa simuladas no servidor | Adaptado; não há gateway nem cobrança real |
| Entrega | Endereço gravado no pedido aprovado e frete gratuito de demonstração | Parcial em relação à operação de entrega; sem logística real |
| Casos de uso e wireframes para orientar o fluxo | Telas funcionais e modelos atualizados do sistema | Evoluído; sem afirmar equivalência visual com wireframes não fornecidos |
| Abordagem ágil baseada em Scrum | Entregas versionadas e ajustes incrementais | Há evidência de evolução no Git, sem registros suficientes para comprovar cerimônias e sprints |

O gerenciamento de produtos, o histórico de pedidos e as regras de integridade complementam o fluxo entregue. A publicação também exigiu configuração de produção, separação de bancos e documentação operacional.

## Cinco melhorias após a avaliação

Os problemas abaixo sintetizam as oportunidades tratadas, com base nas alterações implementadas. Não são citações literais nem resultados quantitativos de participantes.

| Melhoria | Situação anterior | Alteração entregue | Evidência |
| --- | --- | --- | --- |
| Formulários | Telefone sem máscara e campos obrigatórios sem identificação visual uniforme | Máscaras de telefone e CEP, asteriscos e envio dos valores normalizados à API | Commit `e3bae14`, `MaskedInput`, `RequiredMark` e testes de formulários |
| Mensagens | Avisos operacionais em banners dentro das páginas | Toasts de sucesso e erro com fechamento, pausa de leitura e deduplicação | Commit `e7f9c38`, `ToastProvider` e `Toast.test.tsx` |
| Recusa de pagamento | Mensagem no checkout sem página específica para orientar a continuidade | Página de falha com explicação e retorno ao carrinho preservado | Commit `aff4605`, `PaymentFailedPage` e testes do fluxo |
| Contato | Ausência de formulário próprio de contato na aplicação | Fale Conosco com validação, persistência e protocolo | Commit `65db8de`, `ContactPage`, `ContactService` e testes correspondentes |
| Depoimentos | Página inicial sem essa seção | Três cartões estáticos com nomes, estrelas e comentários explicitamente fictícios | Commit `1567f17`, `CustomerReviews` e teste da seção |

As máscaras não substituíram as validações do servidor. A página de recusa não transformou tentativas recusadas em pedidos aprovados. O contato não acrescentou envio automático de e-mail, e os depoimentos não representam uma funcionalidade de avaliações reais.

## Publicação e documentação

A preparação para o Render foi registrada no commit `3f97f46`, com Dockerfile, configuração PostgreSQL, migrations separadas, CORS configurável e validação da URL da API no build. A autora informou a publicação da [loja](https://doce-atelie.onrender.com/) e da [API](https://doce-atelie-api-vh51.onrender.com/).

Nesta revisão, o site respondeu HTTP 200 e a API respondeu `Healthy` no endpoint de saúde. Essa consulta comprova o acesso naquele momento, sem substituir os testes completos nem confirmar as variáveis privadas do ambiente.

Os requisitos, histórias, backlog, arquitetura e diagramas desta pasta descrevem a entrega atual. Itens não implementados permanecem identificados como limites ou possibilidades de evolução, evitando apresentar o planejamento inteiro como se estivesse concluído.
