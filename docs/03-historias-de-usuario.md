# Histórias de usuário

Estas histórias representam a solução implementada e possuem critérios verificáveis. Elas foram elaboradas nesta revisão com base no código e na síntese da PIT I. Não são a transcrição de uma lista original de histórias, pois essa lista não acompanha o PDF fornecido.

O papel de responsável pela loja representa quem utiliza o gerenciamento de produtos. Não implica um perfil autenticado ou uma restrição de acesso, que não existem na versão atual.

| Código | História | Critérios de aceitação | Requisitos |
| --- | --- | --- | --- |
| HU01 | Como visitante, quero conhecer os cupcakes para escolher o que comprar | Mostrar nome, descrição, preço e imagem de produtos ativos; apresentar estado de carregamento e aviso de falha de consulta | RF01 |
| HU02 | Como visitante, quero buscar um sabor para encontrar produtos de meu interesse | Filtrar por nome ou descrição sem diferenciar maiúsculas; informar quando nenhum produto corresponder ao texto | RF02 |
| HU03 | Como responsável pela loja, quero cadastrar e editar cupcakes para manter a vitrine atualizada | Exigir os campos do produto; aceitar somente preço e imagem válidos; confirmar a operação e refletir os dados na vitrine | RF03 |
| HU04 | Como responsável pela loja, quero retirar produtos da vitrine sem perder compras anteriores | Solicitar confirmação na interface; desativar o produto; preservar os dados dos pedidos já registrados | RF04 |
| HU05 | Como cliente, quero adicionar cupcakes e ajustar quantidades para organizar minha compra | Adicionar produto ativo; permitir de 1 a 99 unidades; remover um item e atualizar o total | RF05, RF06 |
| HU06 | Como cliente, quero recuperar meu carrinho ao atualizar a página para continuar minha compra | Guardar o identificador no navegador; consultar os dados na API; manter os itens persistidos | RF07 |
| HU07 | Como cliente, quero informar meus dados para identificar o pedido | Validar nome, e-mail e telefone; associar o cadastro ao carrinho; permitir sua reutilização por um carrinho posterior autorizado pelo identificador anterior | RF08 |
| HU08 | Como cliente, quero informar a entrega com orientação de preenchimento para evitar erros | Marcar campos obrigatórios; aplicar máscaras; manter complemento opcional; validar CEP e UF | RF09, RNF01 |
| HU09 | Como cliente, quero concluir uma compra de demonstração para verificar o processo sem cobrança real | Permitir simulação aprovada; conferir total no servidor; salvar pedido e finalizar carrinho; não solicitar dados de cartão | RF10, RF11 |
| HU10 | Como cliente, quero entender uma recusa e voltar à compra sem perder meus itens | Exibir a página de falha após HTTP 422; explicar que não houve aprovação; oferecer retorno ao carrinho com quantidades preservadas | RF10, RF12 |
| HU11 | Como cliente, quero consultar meus pedidos para conferir compras realizadas neste navegador | Recuperar pedidos pelos identificadores locais; mostrar itens, total, cliente, data e entrega; preservar os valores do momento da compra | RF11, RF13 |
| HU12 | Como visitante, quero enviar uma dúvida ou sugestão para entrar em contato com a loja | Validar nome, e-mail, assunto e mensagem; confirmar com protocolo após resposta da API; limpar o formulário somente no sucesso e preservar o texto em falhas | RF14 |
| HU13 | Como usuário, quero receber mensagens claras para compreender o resultado das ações | Diferenciar sucesso e erro; permitir fechar o toast; pausar o tempo com mouse ou foco; evitar duplicatas visíveis | RF15, RNF03 |
| HU14 | Como visitante, quero visualizar exemplos de depoimentos para conhecer a proposta dessa seção | Exibir três nomes, notas e comentários fictícios; identificar o conteúdo como demonstrativo; reorganizar os cartões em telas menores | RF16, RNF02 |

## Limites de aceitação

As histórias descrevem o resultado esperado dentro da demonstração acadêmica. HU07 não oferece login ou recuperação de conta. HU11 depende dos identificadores disponíveis no navegador e não garante sincronização entre dispositivos. HU12 não inclui atendimento por e-mail ou acompanhamento público do protocolo. HU14 não corresponde a avaliações reais enviadas por compradores.

O status de entrega e as evidências de cada história estão no [backlog atualizado](04-backlog.md). As verificações automatizadas e os cenários manuais estão no [relatório de testes](08-testes-e-validacao.md).
