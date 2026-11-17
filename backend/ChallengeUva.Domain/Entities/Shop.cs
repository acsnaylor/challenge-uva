namespace ChallengeUva.Domain.Entities;

public class Product : EntityBase
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = "";
    public bool IsActive { get; set; } = true;
}

public class Customer : EntityBase
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
}

public class Cart
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public bool Completed { get; set; }
    public int Revision { get; set; }
    public List<CartItem> Items { get; set; } = new();
}

public class CartItem : EntityBase
{
    public Guid CartId { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
}

public class Order : EntityBase
{
    public Guid CartId { get; set; }
    public int CustomerId { get; set; }
    [System.Text.Json.Serialization.JsonIgnore]
    public Customer Customer { get; set; } = null!;
    public string CustomerName { get; set; } = "";
    public string CustomerEmail { get; set; } = "";
    public string CustomerPhone { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string PostalCode { get; set; } = "";
    public string Street { get; set; } = "";
    public string Number { get; set; } = "";
    public string Neighborhood { get; set; } = "";
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string Complement { get; set; } = "";
    public decimal Total { get; set; }
    public string PaymentStatus { get; set; } = "Aprovado (simulado)";
    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem : EntityBase
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}
