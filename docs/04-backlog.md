# Backlog atualizado

O backlog foi organizado para representar a situação atual da implementação. As prioridades expressam a importância funcional atribuída nesta revisão e não uma ordem de sprints comprovada. Não há estimativas de esforço ou datas de entrega inventadas.

## Itens entregues

| Item | Entrega | Prioridade | Histórias | Situação e evidência |
| --- | --- | --- | --- | --- |
| PB01 | Vitrine de cupcakes com informações e imagens | Alta | HU01 | Concluído em `Storefront` e GET de produtos |
| PB02 | Busca por nome e descrição | Média | HU02 | Concluído na filtragem da vitrine |
| PB03 | Cadastro e edição de produtos | Alta | HU03 | Concluído em `AdminPage` e `SaveProduct` |
| PB04 | Remoção lógica de produtos | Alta | HU04 | Concluído em `DeleteProduct`, sem apagar o histórico |
| PB05 | Inclusão, alteração de quantidade e remoção de itens | Alta | HU05 | Concluído em `SetQuantity` e `CartPage` |
| PB06 | Persistência e recuperação do carrinho | Alta | HU06 | Concluído na API e em `ShopContext` |
| PB07 | Cadastro do cliente no checkout | Alta | HU07 | Concluído com validação e vínculo ao carrinho |
| PB08 | Informações de entrega | Alta | HU08 | Concluído nos contratos e no checkout |
| PB09 | Pagamento simulado e registro do pedido | Alta | HU09 | Concluído, com totalização e transação no servidor |
| PB10 | Histórico dos pedidos deste navegador | Alta | HU11 | Concluído, com dados históricos da compra |
| PB11 | Máscaras e indicação dos campos obrigatórios | Alta | HU08 | Concluído no commit `e3bae14` |
| PB12 | Notificações toast | Média | HU13 | Concluído no commit `e7f9c38` |
| PB13 | Página de pagamento recusado | Alta | HU10 | Concluído no commit `aff4605` |
| PB14 | Fale Conosco com persistência e protocolo | Média | HU12 | Concluído no commit `65db8de` |
| PB15 | Depoimentos demonstrativos | Média | HU14 | Concluído no commit `1567f17` |
| PB16 | Configuração de publicação e PostgreSQL | Alta | Transversal | Concluído no commit `3f97f46`; publicação informada pela autora e acesso público consultado |
| PB17 | Testes e documentação da implementação | Alta | Transversal | Suítes existentes e documentação acadêmica desta revisão |

Concluído significa disponível no código dentro do escopo descrito. Não significa que estejam entregues autenticação administrativa, pagamento real ou logística.

## Evoluções não implementadas

| Item | Possibilidade de evolução | Origem e situação | Prioridade sugerida |
| --- | --- | --- | --- |
| PE01 | Login e autenticação do cliente | Login mencionado na PIT I; não implementado | Alta |
| PE02 | Autorização da gestão de produtos | Limitação identificada na implementação publicada; não implementada | Alta |
| PE03 | Recuperação de conta e histórico entre dispositivos | Complemento possível ao cadastro autenticado; não implementado | Média |
| PE04 | Aplicativo mobile nativo | PIT I descreve aplicativo mobile; entrega atual é web responsiva | A definir |
| PE05 | Pagamento por gateway real | Pagamento foi entregue como simulação; integração externa não implementada | A definir |
| PE06 | Operação de entrega com frete e rastreamento | PIT I menciona entrega sem detalhar operação; implementação atual coleta endereço e usa frete zero | A definir |

As prioridades desta segunda tabela são recomendações de continuidade, sem compromisso de prazo. Não há evidência no PDF de que upload de imagens, estoque ou avaliações reais tenham sido requisitos detalhados da PIT I. Eles também não fazem parte da entrega atual.

## Rastreabilidade

A primeira implementação funcional está no commit `87e3ef8`. As cinco melhorias foram separadas nos commits indicados. A [comparação entre as disciplinas](09-evolucao-pit-i-pit-ii.md) explica as mudanças de escopo, e o [relatório de testes](08-testes-e-validacao.md) relaciona a verificação das entregas.
