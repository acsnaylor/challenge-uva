using System.ComponentModel.DataAnnotations;
using ChallengeUva.Domain.Entities;
using ChallengeUva.Domain.Requests;
using ChallengeUva.Infrastructure.Data.Contexts;
using Microsoft.EntityFrameworkCore;

namespace ChallengeUva.Application.Services;

public class ShopException : Exception
{
    public int Status { get; }
    public ShopException(string message, int status = 400) : base(message) => Status = status;
}

public record CartLine(int ProductId, string Name, string ImageUrl, decimal UnitPrice, int Quantity, bool Available);
public record CartView(Guid Id, Customer? Customer, bool Completed, List<CartLine> Items, decimal Total);

public class ShopService
{
    private readonly ChallengeUvaContext db;
    public ShopService(ChallengeUvaContext db) => this.db = db;

    private static void Validate(object request)
    {
        var errors = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request), errors, true))
            throw new ShopException(string.Join(" ", errors.Select(e => e.ErrorMessage)));
    }

    public Task<List<Product>> Products() => db.Products.AsNoTracking().Where(p => p.IsActive).OrderBy(p => p.Name).ToListAsync();

    public async Task<Product> GetProduct(int id) => await db.Products.AsNoTracking().SingleOrDefaultAsync(p => p.Id == id && p.IsActive)
        ?? throw new ShopException("Produto não encontrado.", 404);

    public async Task<Product> SaveProduct(int? id, ProductRequest request)
    {
        request.Name = request.Name.Trim(); request.Description = request.Description.Trim();
        Validate(request);
        if (decimal.Round(request.Price, 2) != request.Price) throw new ShopException("Preço deve ter no máximo duas casas decimais.");
        if (!(request.ImageUrl.StartsWith("/images/", StringComparison.Ordinal) ||
            (Uri.TryCreate(request.ImageUrl, UriKind.Absolute, out var uri) && (uri.Scheme == "https" || uri.Scheme == "http"))))
            throw new ShopException("Use uma URL de imagem HTTP/HTTPS ou um caminho /images/.");
        var product = id.HasValue ? await db.Products.SingleOrDefaultAsync(p => p.Id == id && p.IsActive)
            ?? throw new ShopException("Produto não encontrado.", 404) : new Product();
        product.Name = request.Name; product.Description = request.Description;
        product.Price = request.Price; product.ImageUrl = request.ImageUrl;
        if (!id.HasValue) db.Products.Add(product);
        await db.SaveChangesAsync(); return product;
    }

    public async Task DeleteProduct(int id)
    {
        var product = await db.Products.SingleOrDefaultAsync(p => p.Id == id && p.IsActive)
            ?? throw new ShopException("Produto não encontrado.", 404);
        product.IsActive = false; await db.SaveChangesAsync();
    }

    public async Task<CartView> CreateCart(Guid? previousCartId = null)
    {
        var cart = new Cart();
        if (previousCartId.HasValue) cart.Customer = (await LoadCart(previousCartId.Value)).Customer;
        db.Carts.Add(cart); await db.SaveChangesAsync(); return View(cart);
    }

    private async Task<Cart> LoadCart(Guid id, bool editable = false)
    {
        var cart = await db.Carts.Include(c => c.Customer).Include(c => c.Items).ThenInclude(i => i.Product)
            .SingleOrDefaultAsync(c => c.Id == id) ?? throw new ShopException("Carrinho não encontrado.", 404);
        if (editable && cart.Completed) throw new ShopException("Este carrinho já foi finalizado.", 409);
        return cart;
    }

    private static CartView View(Cart cart) => new(cart.Id, cart.Customer, cart.Completed,
        cart.Items.Select(i => new CartLine(i.ProductId, i.Product.Name, i.Product.ImageUrl, i.Product.Price, i.Quantity, i.Product.IsActive)).ToList(),
        cart.Items.Sum(i => i.Quantity * i.Product.Price));

    public async Task<CartView> GetCart(Guid id) => View(await LoadCart(id));

    public async Task<CartView> SetQuantity(Guid id, int productId, CartItemRequest request)
    {
        Validate(request);
        var cart = await LoadCart(id, true);
        var line = cart.Items.SingleOrDefault(i => i.ProductId == productId);
        if (request.Quantity == 0)
        {
            if (line != null) { cart.Items.Remove(line); db.CartItems.Remove(line); }
        }
        else
        {
            var product = await db.Products.SingleOrDefaultAsync(p => p.Id == productId && p.IsActive)
                ?? throw new ShopException("Produto indisponível.", 404);
            if (line == null) cart.Items.Add(new CartItem { ProductId = productId, Product = product, Quantity = request.Quantity });
            else line.Quantity = request.Quantity;
        }
        cart.Revision++; await db.SaveChangesAsync(); return View(cart);
    }

    public async Task<CartView> RegisterCustomer(Guid id, CustomerRequest request)
    {
        request.Name = request.Name.Trim(); request.Email = request.Email.Trim().ToLowerInvariant(); Validate(request);
        var cart = await LoadCart(id, true);
        if (await db.Customers.AnyAsync(c => c.Email == request.Email && c.Id != cart.CustomerId))
            throw new ShopException("Este e-mail já possui cadastro em outro carrinho. Use o carrinho original ou outro e-mail.", 409);
        var customer = cart.Customer ?? new Customer();
        customer.Name = request.Name; customer.Email = request.Email; customer.Phone = request.Phone;
        cart.Customer = customer; cart.Revision++;
        await db.SaveChangesAsync(); return View(cart);
    }

    public async Task<Order> GetOrder(Guid cartId) => await db.Orders.AsNoTracking().Include(o => o.Items)
        .SingleOrDefaultAsync(o => o.CartId == cartId) ?? throw new ShopException("Pedido não encontrado.", 404);

    public async Task<Order> Checkout(Guid id, CheckoutRequest request)
    {
        Validate(request);
        var cart = await LoadCart(id);
        if (cart.Completed) return await GetOrder(id);
        if (cart.Customer == null) throw new ShopException("Cadastre o cliente antes de finalizar.");
        if (cart.Items.Count == 0) throw new ShopException("O carrinho está vazio.");
        if (cart.Items.Any(i => !i.Product.IsActive)) throw new ShopException("Remova os produtos indisponíveis do carrinho.", 409);
        var total = cart.Items.Sum(i => i.Product.Price * i.Quantity);
        if (request.ExpectedTotal != total) throw new ShopException("Os preços foram alterados. Atualize o carrinho e confira o total.", 409);
        if (request.PaymentSimulation == "declined") throw new ShopException("Pagamento simulado recusado. Tente novamente com aprovação.", 422);
        var order = new Order {
            CartId = cart.Id, CustomerId = cart.Customer.Id, Customer = cart.Customer,
            CustomerName = cart.Customer.Name, CustomerEmail = cart.Customer.Email, CustomerPhone = cart.Customer.Phone,
            PostalCode = request.PostalCode, Street = request.Street.Trim(), Number = request.Number.Trim(),
            Neighborhood = request.Neighborhood.Trim(), City = request.City.Trim(), State = request.State,
            Complement = request.Complement.Trim(), Total = total,
            Items = cart.Items.Select(i => new OrderItem { ProductId = i.ProductId, ProductName = i.Product.Name,
                UnitPrice = i.Product.Price, Quantity = i.Quantity }).ToList()
        };
        db.Orders.Add(order); cart.Completed = true; cart.Revision++;
        // One SaveChanges transaction persists the order and closes its cart atomically.
        await db.SaveChangesAsync(); return order;
    }
}
