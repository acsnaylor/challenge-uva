# Modelagem UML

Os diagramas representam o sistema atual, com foco nas funcionalidades comerciais. Não incluem login, gateway externo, estoque ou rastreamento, pois essas funcionalidades não existem no código.

## Casos de uso

Mermaid não possui sintaxe nativa de casos de uso UML. A representação abaixo adapta os atores, a fronteira do sistema, os casos e as relações de inclusão e extensão para um flowchart visualizável no GitHub. As formas arredondadas representam os casos de uso. A relação `include` indica uma parte necessária da finalização, enquanto `extend` representa a orientação exibida na condição de recusa.

```mermaid
flowchart LR
    cliente["«actor» Visitante ou cliente"]
    responsavel["«actor» Responsável pela loja"]
    subgraph sistema["Doce Ateliê"]
        catalogo(["Consultar vitrine e buscar cupcakes"])
        carrinho(["Organizar carrinho e quantidades"])
        finalizar(["Finalizar compra demonstrativa"])
        dados(["Informar cliente e entrega"])
        pagamento(["Simular pagamento"])
        recusa(["Receber orientação sobre recusa"])
        pedidos(["Consultar pedidos deste navegador"])
        mensagem(["Enviar mensagem de contato"])
        exemplos(["Consultar depoimentos demonstrativos"])
        cadastrar(["Cadastrar e editar produto"])
        desativar(["Retirar produto da vitrine"])
    end
    cliente --- catalogo
    cliente --- carrinho
    cliente --- finalizar
    cliente --- pedidos
    cliente --- mensagem
    cliente --- exemplos
    responsavel --- cadastrar
    responsavel --- desativar
    finalizar -.->|"«include»"| dados
    finalizar -.->|"«include»"| pagamento
    recusa -.->|"«extend» quando recusado"| finalizar
```

Responsável pela loja é um papel de negócio, não um perfil autenticado. A interface e os endpoints de gerenciamento não têm controle de acesso administrativo. O sistema de pagamento não aparece como ator externo porque a simulação é feita pelo próprio serviço da loja.

## Classes do domínio

O diagrama mostra as entidades efetivamente utilizadas pela loja e seus atributos. As operações de negócio ficam em `ShopService` e `ContactService`, em vez de métodos nas entidades. `EntityBase` fornece a chave numérica às classes derivadas; `Cart` possui seu próprio UUID.

```mermaid
classDiagram
    class EntityBase {
        <<abstract>>
        +int Id
    }
    class Product {
        +string Name
        +string Description
        +decimal Price
        +string ImageUrl
        +bool IsActive
    }
    class Customer {
        +string Name
        +string Email
        +string Phone
    }
    class Cart {
        +Guid Id
        +int? CustomerId
        +Customer Customer
        +bool Completed
        +int Revision
        +List~CartItem~ Items
    }
    class CartItem {
        +Guid CartId
        +int ProductId
        +Product Product
        +int Quantity
    }
    class Order {
        +Guid CartId
        +int CustomerId
        +Customer Customer
        +string CustomerName
        +string CustomerEmail
        +string CustomerPhone
        +DateTime CreatedAt
        +string PostalCode
        +string Street
        +string Number
        +string Neighborhood
        +string City
        +string State
        +string Complement
        +decimal Total
        +string PaymentStatus
        +List~OrderItem~ Items
    }
    class OrderItem {
        +int OrderId
        +int ProductId
        +string ProductName
        +decimal UnitPrice
        +int Quantity
    }
    class ContactMessage {
        +string Name
        +string Email
        +string Subject
        +string Message
        +DateTime CreatedAt
    }
    EntityBase <|-- Product
    EntityBase <|-- Customer
    EntityBase <|-- CartItem
    EntityBase <|-- Order
    EntityBase <|-- OrderItem
    EntityBase <|-- ContactMessage
    Cart "0..*" --> "0..1" Customer : Customer
    Cart "1" *-- "0..*" CartItem : Items
    CartItem "0..*" --> "1" Product : Product
    Order "0..*" --> "1" Customer : Customer
    Cart "1" -- "0..1" Order : CartId
    Order "1" *-- "0..*" OrderItem : Items
```

`OrderItem.ProductId` é um identificador histórico sem associação configurada como chave estrangeira para `Product`. O nome e o preço são copiados para o item. Também não existem classes independentes de endereço ou pagamento no domínio. Esses dados fazem parte de `Order`.

O modelo relacional completo das entidades comerciais, com chaves e tipos de armazenamento, está em [Banco de dados](06-banco-de-dados.md).

## Sequência de finalização da compra

O fluxo começa com um carrinho aberto e um formulário preenchido. O cadastro do cliente é uma requisição anterior à finalização. Por isso, uma recusa pode manter o cliente salvo, mesmo sem gerar pedido.

```mermaid
sequenceDiagram
    actor Cliente
    participant Tela as CheckoutPage
    participant API as CartsController
    participant Servico as ShopService
    participant Banco as Contexto EF e banco
    Cliente->>Tela: Preencher cliente, entrega e simulação
    Tela->>Tela: Validar campos e remover máscaras
    Tela->>API: PUT /api/carts/id/customer
    API->>Servico: RegisterCustomer
    Servico->>Banco: Salvar cliente e revisão do carrinho
    Banco-->>Servico: Cadastro persistido
    Servico-->>API: Carrinho atualizado
    API-->>Tela: HTTP 200
    Tela->>API: POST /api/carts/id/checkout
    API->>Servico: Checkout com ExpectedTotal
    Servico->>Banco: Carregar carrinho, cliente, itens e produtos
    Banco-->>Servico: Dados atuais
    Servico->>Servico: Validar disponibilidade e calcular total
    alt Carrinho inválido ou total divergente
        Servico-->>API: Erro de negócio
        API-->>Tela: HTTP 400 ou 409
        Tela-->>Cliente: Toast e permanência no checkout
    else Pagamento simulado recusado
        Servico-->>API: ShopException sem criar pedido
        API-->>Tela: HTTP 422
        Tela->>API: GET /api/carts/id
        API->>Servico: GetCart
        Servico->>Banco: Consultar carrinho preservado
        Banco-->>Servico: Itens e quantidades
        Servico-->>API: Carrinho
        API-->>Tela: HTTP 200
        Tela-->>Cliente: Página de falha com retorno ao carrinho
    else Pagamento simulado aprovado
        Servico->>Servico: Criar pedido e cópias dos dados da compra
        Servico->>Banco: SaveChangesAsync de pedido, itens e carrinho concluído
        Banco-->>Servico: Transação concluída
        Servico-->>API: Pedido persistido
        API-->>Tela: HTTP 200 com pedido
        Tela->>Tela: Guardar identificador e remover carrinho atual
        Tela-->>Cliente: Toast e página de confirmação
    end
```

O diagrama apresenta as decisões principais. A atualização do carrinho também é tentada após outros erros do checkout. Uma nova chamada válida diretamente ao endpoint de finalização de um carrinho concluído recupera o pedido existente, sem criar uma segunda compra.

## Sequência de envio de contato

```mermaid
sequenceDiagram
    actor Visitante
    participant Tela as ContactPage
    participant API as ContactMessagesController
    participant Servico as ContactService
    participant Banco as Contexto EF e banco
    Visitante->>Tela: Preencher nome, e-mail, assunto e mensagem
    Tela->>Tela: Validar e bloquear envio simultâneo
    Tela->>API: POST /api/contact-messages
    API->>Servico: ReceiveAsync
    Servico->>Servico: Normalizar textos e validar campos
    alt Dados inválidos
        Servico-->>API: Erro de validação
        API-->>Tela: HTTP 400
        Tela-->>Visitante: Toast de erro e preenchimento mantido
    else Dados válidos
        Servico->>Banco: SaveChangesAsync da mensagem
        Banco-->>Servico: Identificador gerado
        Servico-->>API: ContactMessageReceipt
        API-->>Tela: HTTP 201 com protocolo e confirmação
        Tela->>Tela: Limpar formulário
        Tela-->>Visitante: Toast com protocolo
    end
```

Os controllers também podem rejeitar uma entrada inválida antes da chamada ao serviço. Em falhas de comunicação ou persistência, o formulário mantém o conteúdo para nova tentativa. Não há etapa de envio de e-mail ou consulta pública do protocolo.
