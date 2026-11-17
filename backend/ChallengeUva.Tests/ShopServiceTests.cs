using System;
using System.Linq;
using System.Threading.Tasks;
using ChallengeUva.Application.Services;
using ChallengeUva.Domain.Entities;
using ChallengeUva.Domain.Requests;
using ChallengeUva.Infrastructure.Data.Contexts;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ChallengeUva.Tests;

// Uses the real SQLite provider and migrations, not mocked repositories.
public class ShopServiceTests : IDisposable
{
    private readonly SqliteConnection connection = new("Data Source=:memory:");
    private readonly DbContextOptions<ChallengeUvaContext> options;
    private readonly ChallengeUvaContext db;
    private readonly ShopService shop;
    public ShopServiceTests()
    {
        connection.Open();
        options = new DbContextOptionsBuilder<ChallengeUvaContext>().UseSqlite(connection).Options;
        db = new ChallengeUvaContext(options); db.Database.Migrate(); shop = new ShopService(db);
    }
    public void Dispose() { db.Dispose(); connection.Dispose(); }
    private static ProductRequest Product(decimal price = 16.90m) => new() { Name = "Chocolate Belga", Description = "Cupcake artesanal de chocolate belga.", Price = price, ImageUrl = "/images/chocolate.svg" };
    private static CustomerRequest Customer(string email = "ana@example.com") => new() { Name = "Ana Silva", Email = email, Phone = "11999999999" };
    private static CheckoutRequest Delivery(decimal total = 33.80m, string payment = "approved") => new() {
        PostalCode = "01310-100", Street = "Avenida Paulista", Number = "100", Neighborhood = "Bela Vista", City = "São Paulo", State = "SP", ExpectedTotal = total, PaymentSimulation = payment
    };
    private async Task<(CartView cart, Product product)> Ready()
    {
        var product = await shop.SaveProduct(null, Product());
        var cart = await shop.CreateCart();
        await shop.SetQuantity(cart.Id, product.Id, new CartItemRequest { Quantity = 2 });
        return (await shop.RegisterCustomer(cart.Id, Customer()), product);
    }

    [Fact] public async Task ProductCrudPersistsAndSoftDeleteHidesProduct()
    {
        var p = await shop.SaveProduct(null, Product());
        await shop.SaveProduct(p.Id, Product(19.50m));
        using var reloaded = new ChallengeUvaContext(options);
        (await reloaded.Products.SingleAsync()).Price.Should().Be(19.50m);
        await shop.DeleteProduct(p.Id);
        (await shop.Products()).Should().BeEmpty();
        (await reloaded.Products.AsNoTracking().SingleAsync()).IsActive.Should().BeFalse();
    }

    [Theory] [InlineData(0)] [InlineData(-1)] [InlineData(16.999)]
    public async Task RejectInvalidPrices(decimal price)
    {
        Func<Task> action = () => shop.SaveProduct(null, Product(price));
        await action.Should().ThrowAsync<ShopException>();
        (await shop.Products()).Should().BeEmpty();
    }

    [Fact] public async Task RejectUnsafeImageUrl()
    {
        var request = Product(); request.ImageUrl = "javascript:alert(1)";
        Func<Task> action = () => shop.SaveProduct(null, request);
        await action.Should().ThrowAsync<ShopException>();
    }

    [Fact] public async Task QuantityChangesAndRemovalPersistInAnotherContext()
    {
        var (cart, product) = await Ready();
        await shop.SetQuantity(cart.Id, product.Id, new CartItemRequest { Quantity = 3 });
        using var other = new ChallengeUvaContext(options);
        var persisted = await new ShopService(other).GetCart(cart.Id);
        persisted.Total.Should().Be(50.70m); persisted.Items.Single().Quantity.Should().Be(3);
        await shop.SetQuantity(cart.Id, product.Id, new CartItemRequest { Quantity = 0 });
        (await shop.GetCart(cart.Id)).Items.Should().BeEmpty();
    }

    [Theory] [InlineData(-1)] [InlineData(100)]
    public async Task RejectInvalidQuantities(int quantity)
    {
        var (cart, product) = await Ready();
        Func<Task> action = () => shop.SetQuantity(cart.Id, product.Id, new CartItemRequest { Quantity = quantity });
        await action.Should().ThrowAsync<ShopException>();
        (await shop.GetCart(cart.Id)).Items.Single().Quantity.Should().Be(2);
    }

    [Fact] public async Task CheckoutCreatesPersistentOrderAndSnapshotsPricesAndCustomer()
    {
        var (cart, product) = await Ready();
        var order = await shop.Checkout(cart.Id, Delivery());
        await shop.SaveProduct(product.Id, Product(25));
        using var other = new ChallengeUvaContext(options);
        var saved = await new ShopService(other).GetOrder(cart.Id);
        saved.Id.Should().Be(order.Id); saved.Total.Should().Be(33.80m);
        saved.CreatedAt.Kind.Should().Be(DateTimeKind.Utc);
        saved.Items.Single().UnitPrice.Should().Be(16.90m);
        saved.CustomerName.Should().Be("Ana Silva"); saved.Street.Should().Be("Avenida Paulista");
        (await shop.GetCart(cart.Id)).Completed.Should().BeTrue();
    }

    [Fact] public async Task CheckoutRetryReturnsSameOrder()
    {
        var (cart, _) = await Ready();
        var first = await shop.Checkout(cart.Id, Delivery());
        var retry = await shop.Checkout(cart.Id, Delivery());
        retry.Id.Should().Be(first.Id); (await db.Orders.CountAsync()).Should().Be(1);
    }

    [Fact] public async Task DeclinedPaymentKeepsCartOpenAndDoesNotCreateOrder()
    {
        var (cart, _) = await Ready();
        Func<Task> action = () => shop.Checkout(cart.Id, Delivery(payment: "declined"));
        (await action.Should().ThrowAsync<ShopException>()).Which.Status.Should().Be(422);
        (await db.Orders.CountAsync()).Should().Be(0);
        (await shop.GetCart(cart.Id)).Completed.Should().BeFalse();
        (await shop.Checkout(cart.Id, Delivery())).Total.Should().Be(33.80m);
    }

    [Fact] public async Task RejectCheckoutWithChangedPrice()
    {
        var (cart, product) = await Ready(); await shop.SaveProduct(product.Id, Product(20));
        Func<Task> action = () => shop.Checkout(cart.Id, Delivery());
        (await action.Should().ThrowAsync<ShopException>()).Which.Status.Should().Be(409);
        (await db.Orders.CountAsync()).Should().Be(0);
    }

    [Fact] public async Task RejectCheckoutWithUnavailableProduct()
    {
        var (cart, product) = await Ready(); await shop.DeleteProduct(product.Id);
        Func<Task> action = () => shop.Checkout(cart.Id, Delivery());
        await action.Should().ThrowAsync<ShopException>();
        (await db.Orders.CountAsync()).Should().Be(0);
    }

    [Fact] public async Task RejectEmptyCartAndMissingCustomer()
    {
        var cart = await shop.CreateCart();
        Func<Task> action = () => shop.Checkout(cart.Id, Delivery());
        await action.Should().ThrowAsync<ShopException>();
        await shop.RegisterCustomer(cart.Id, Customer());
        await action.Should().ThrowAsync<ShopException>();
    }

    [Fact] public async Task ValidateCustomerAndDelivery()
    {
        var (cart, _) = await Ready();
        Func<Task> invalidCustomer = () => shop.RegisterCustomer(cart.Id, Customer("invalid"));
        await invalidCustomer.Should().ThrowAsync<ShopException>();
        var request = Delivery(); request.State = "XX";
        Func<Task> invalidDelivery = () => shop.Checkout(cart.Id, request);
        await invalidDelivery.Should().ThrowAsync<ShopException>();
        (await db.Orders.CountAsync()).Should().Be(0);
    }

    [Fact] public async Task NextCartReusesCustomerAndPreservesOldOrderSnapshot()
    {
        var (cart, _) = await Ready(); await shop.Checkout(cart.Id, Delivery());
        var next = await shop.CreateCart(cart.Id);
        next.Customer!.Id.Should().Be(cart.Customer!.Id);
        var customer = Customer(); customer.Name = "Ana Atualizada";
        await shop.RegisterCustomer(next.Id, customer);
        (await shop.GetOrder(cart.Id)).CustomerName.Should().Be("Ana Silva");
        (await db.Customers.CountAsync()).Should().Be(1);
    }

    [Fact] public async Task ClosedCartCannotBeModified()
    {
        var (cart, product) = await Ready(); await shop.Checkout(cart.Id, Delivery());
        Func<Task> action = () => shop.SetQuantity(cart.Id, product.Id, new CartItemRequest { Quantity = 1 });
        (await action.Should().ThrowAsync<ShopException>()).Which.Status.Should().Be(409);
    }

    [Fact] public async Task StaleCartRevisionPreventsConcurrentMutation()
    {
        var (cart, product) = await Ready();
        using var other = new ChallengeUvaContext(options);
        var otherShop = new ShopService(other);
        await otherShop.GetCart(cart.Id);
        await shop.SetQuantity(cart.Id, product.Id, new CartItemRequest { Quantity = 3 });
        Func<Task> action = () => otherShop.SetQuantity(cart.Id, product.Id, new CartItemRequest { Quantity = 4 });
        await action.Should().ThrowAsync<DbUpdateConcurrencyException>();
    }

    [Fact] public async Task MissingCartReturns404()
    {
        Func<Task> action = () => shop.GetCart(Guid.NewGuid());
        (await action.Should().ThrowAsync<ShopException>()).Which.Status.Should().Be(404);
    }
}
