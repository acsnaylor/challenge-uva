# Documentação acadêmica da Doce Ateliê

Esta documentação apresenta a versão implementada na disciplina Projeto Integrador Transdisciplinar em Engenharia de Software II. A leitura parte do planejamento da PIT I e acompanha os requisitos, a solução desenvolvida, sua avaliação e a publicação.

| Documento | Conteúdo |
| --- | --- |
| [Apresentação do projeto](01-apresentacao.md) | Contexto, objetivos, escopo e acesso à aplicação |
| [Requisitos](02-requisitos.md) | Requisitos funcionais, não funcionais e regras de negócio |
| [Histórias de usuário](03-historias-de-usuario.md) | Necessidades dos usuários e critérios de aceitação |
| [Backlog atualizado](04-backlog.md) | Entregas concluídas, evidências e possibilidades de evolução |
| [Arquitetura e tecnologias](05-arquitetura-e-tecnologias.md) | Camadas, comunicação, rotas e ambientes |
| [Banco de dados](06-banco-de-dados.md) | Diagrama relacional, dicionário e integridade dos dados |
| [Diagramas UML](07-diagramas-uml.md) | Casos de uso, classes e sequências de compra e contato |
| [Testes e validação](08-testes-e-validacao.md) | Cobertura funcional, resultados e limites da avaliação |
| [Evolução da PIT I para a PIT II](09-evolucao-pit-i-pit-ii.md) | Comparação com o documento original e cinco melhorias de usabilidade |

## Base documental

A revisão considera o código no commit `3f97f46`, os testes automatizados, o histórico Git e o PDF `PIT_atividade (1).pdf`, disponibilizado pela autora. Os códigos RF, RNF, HU e PB foram definidos nesta documentação para organizar a rastreabilidade. Não correspondem a identificadores transcritos da PIT I.

O PDF original contém uma descrição do planejamento, sem anexar as tabelas completas de requisitos, histórias, backlog ou as imagens dos modelos. Por isso, os documentos atuais foram reconstruídos a partir da implementação e não apresentados como cópias daqueles artefatos. O arquivo original não foi incorporado ao repositório público.

Os diagramas Mermaid podem ser visualizados nas páginas Markdown do GitHub. O diagrama de casos de uso utiliza uma representação adaptada, explicada no próprio documento, pois Mermaid não possui uma notação nativa específica para esse tipo de UML.

## Aplicação publicada

- [Loja Doce Ateliê](https://doce-atelie.onrender.com/)
- [API](https://doce-atelie-api-vh51.onrender.com/)
- [Swagger](https://doce-atelie-api-vh51.onrender.com/swagger)
- [Verificação de saúde](https://doce-atelie-api-vh51.onrender.com/health)

Os endereços foram informados pela autora. Nesta revisão, o acesso ao site e à verificação de saúde retornou HTTP 200, com resposta `Healthy` na API. Essa consulta não substitui um teste completo do ambiente publicado.

[Voltar ao README do projeto](../README.md)
