using System.ComponentModel.DataAnnotations;

namespace ChallengeUva.Domain.Requests;

public class ProductRequest
{
    [Required, StringLength(100, MinimumLength = 2)] public string Name { get; set; } = "";
    [Required, StringLength(1000, MinimumLength = 10)] public string Description { get; set; } = "";
    [Range(typeof(decimal), "0.01", "9999.99", ParseLimitsInInvariantCulture = true)] public decimal Price { get; set; }
    [Required, StringLength(2000)] public string ImageUrl { get; set; } = "";
}

public class CustomerRequest
{
    [Required, StringLength(100, MinimumLength = 2)] public string Name { get; set; } = "";
    [Required, EmailAddress, StringLength(254)] public string Email { get; set; } = "";
    [Required, RegularExpression(@"^\d{10,11}$", ErrorMessage = "Informe telefone com DDD, usando 10 ou 11 dígitos.")]
    public string Phone { get; set; } = "";
}

public class CartItemRequest
{
    [Range(0, 99)] public int Quantity { get; set; }
}

public class CheckoutRequest
{
    [Required, RegularExpression(@"^\d{5}-?\d{3}$")] public string PostalCode { get; set; } = "";
    [Required, StringLength(150)] public string Street { get; set; } = "";
    [Required, StringLength(20)] public string Number { get; set; } = "";
    [Required, StringLength(100)] public string Neighborhood { get; set; } = "";
    [Required, StringLength(100)] public string City { get; set; } = "";
    [Required, RegularExpression("^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$")]
    public string State { get; set; } = "";
    [StringLength(150)] public string Complement { get; set; } = "";
    [Required, RegularExpression("^(approved|declined)$")] public string PaymentSimulation { get; set; } = "approved";
    [Range(typeof(decimal), "0.01", "9999999", ParseLimitsInInvariantCulture = true)] public decimal ExpectedTotal { get; set; }
}
