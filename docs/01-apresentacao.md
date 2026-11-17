# Apresentação do projeto

## Contexto

A Doce Ateliê é uma loja virtual demonstrativa de cupcakes gourmet desenvolvida para a disciplina Projeto Integrador Transdisciplinar em Engenharia de Software II. O trabalho dá continuidade ao planejamento realizado na PIT I, quando foram discutidos requisitos, histórias de usuário, priorização do backlog, casos de uso e wireframes.

A situação-problema descrita no documento da PIT I envolvia uma loja que havia enfrentado dificuldades com um sistema anterior, associadas à falta de organização dos requisitos. A proposta buscou organizar a experiência de compra e tornar mais claras as necessidades dos clientes e da loja.

Na PIT II, esse planejamento foi desenvolvido como uma aplicação web responsiva. O usuário pode conhecer os produtos, organizar um carrinho, informar seus dados e endereço e concluir uma compra com pagamento simulado. O gerenciamento dos produtos e a persistência dos pedidos fazem parte da solução.

## Objetivo geral

Implementar e avaliar uma loja virtual de cupcakes gourmet com integração entre interface, API e banco de dados, utilizando os feedbacks dos testes para melhorar a experiência de uso.

## Objetivos específicos

- Apresentar os cupcakes com nome, descrição, imagem e preço.
- Permitir o cadastro, a edição e a retirada de produtos da vitrine.
- Manter o carrinho no servidor e permitir alterações de quantidade.
- Registrar cliente, entrega e pedido sem depender de pagamento real.
- Validar os formulários e informar o resultado das operações.
- Disponibilizar um canal de contato e conteúdo demonstrativo de avaliações.
- Preservar a execução local e preparar a publicação com banco de dados separado.
- Documentar a solução e verificar seus principais fluxos por testes automatizados.

## Desenvolvimento e avaliação

A PIT I descreve uma abordagem ágil baseada em Scrum para organizar o planejamento. No repositório da PIT II, a evolução pode ser acompanhada por entregas e commits. Não há atas de cerimônias, registros de sprints ou medições que permitam afirmar a adoção integral de Scrum durante a implementação.

A primeira versão funcional foi seguida por cinco melhorias relacionadas à avaliação de usabilidade. Foram incluídas máscaras e indicação de campos obrigatórios, notificações toast, uma página para pagamento recusado, o Fale Conosco e depoimentos demonstrativos na página inicial.

As mudanças foram registradas em commits separados. Esta documentação relaciona cada uma delas ao código e aos testes, sem atribuir aos participantes frases, quantidades ou resultados estatísticos não documentados.

## Escopo entregue

A solução contém vitrine com busca, gerenciamento de produtos, carrinho persistido, cadastro do cliente no checkout, endereço de entrega, pagamento simulado, confirmação e histórico de pedidos. Também contém formulário de contato com protocolo e uma seção de avaliações fictícias identificadas como exemplos.

O cadastro do cliente não corresponde a uma conta autenticada. O histórico é recuperado a partir dos identificadores mantidos no navegador. A entrega é gratuita na demonstração e não há operação logística real. O pagamento não solicita cartão e não realiza cobranças.

Não foram implementados login, recuperação de senha, autorização administrativa, estoque, cálculo de frete, rastreamento, upload de imagens, gateway de pagamento, resposta automática por e-mail ou cadastro de avaliações reais. Esses limites precisam ser considerados ao comparar a entrega com o planejamento inicial.

## Publicação

| Recurso | Endereço |
| --- | --- |
| Interface da loja | [doce-atelie.onrender.com](https://doce-atelie.onrender.com/) |
| API | [doce-atelie-api-vh51.onrender.com](https://doce-atelie-api-vh51.onrender.com/) |
| Documentação da API | [Swagger](https://doce-atelie-api-vh51.onrender.com/swagger) |
| Saúde da API | [Health check](https://doce-atelie-api-vh51.onrender.com/health) |

A publicação utiliza a separação entre site estático e API prevista na configuração do projeto. O código mantém SQLite no desenvolvimento e seleciona PostgreSQL em produção. A revisão documental não acessou o painel do Render nem suas credenciais.

## Evidências

As funcionalidades são identificáveis nas [rotas da aplicação](../frontend/src/app/App.tsx), nos [serviços da loja](../backend/ChallengeUva.Application/Services/ShopService.cs), no [serviço de contato](../backend/ChallengeUva.Application/Services/ContactService.cs) e nas [suítes de testes](08-testes-e-validacao.md). A comparação com o documento da PIT I está em [Evolução do projeto](09-evolucao-pit-i-pit-ii.md).
