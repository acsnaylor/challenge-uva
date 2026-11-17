using System;
using System.Linq;
using System.Threading.Tasks;
using ChallengeUva.Application.Services;
using ChallengeUva.Domain.Requests;
using ChallengeUva.Infrastructure.Data;
using ChallengeUva.Infrastructure.Data.Contexts;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace ChallengeUva.Tests;

public class PostgresFactAttribute : FactAttribute
{
    public PostgresFactAttribute()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("TEST_POSTGRES_CONNECTION")))
            Skip = "Defina TEST_POSTGRES_CONNECTION para um PostgreSQL exclusivo de testes. Nunca use o banco do Render.";
    }
}

public class PostgresIntegrationTests
{
    [PostgresFact]
    public async Task MigrationsAndFullShopFlowPersistOnRealPostgres()
    {
        var connectionString = PostgresConnection.Parse(Environment.GetEnvironmentVariable("TEST_POSTGRES_CONNECTION")!);
        var schema = "pit_test_" + Guid.NewGuid().ToString("N");
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();
        await using (var command = new NpgsqlCommand($"CREATE SCHEMA \"{schema}\"", connection)) await command.ExecuteNonQueryAsync();
        try
        {
            var scopedConnection = new NpgsqlConnectionStringBuilder(connectionString) { SearchPath = schema };
            var options = new DbContextOptionsBuilder<PostgresChallengeUvaContext>()
                .UseNpgsql(scopedConnection.ConnectionString, pg => pg.MigrationsHistoryTable("__EFMigrationsHistory", schema)).Options;
            await using var db = new PostgresChallengeUvaContext(options);
            await db.Database.MigrateAsync();
            var shop = new ShopService(db);
            var product = await shop.SaveProduct(null, new ProductRequest {
                Name = "Cupcake PostgreSQL", Description = "Produto usado no teste de integração PostgreSQL.", Price = 16.90m, ImageUrl = "/images/chocolate.svg",
            });
            var cart = await shop.CreateCart();
            await shop.SetQuantity(cart.Id, product.Id, new CartItemRequest { Quantity = 3 });
            await shop.SetQuantity(cart.Id, product.Id, new CartItemRequest { Quantity = 2 });
            await shop.RegisterCustomer(cart.Id, new CustomerRequest { Name = "Cliente Teste", Email = "cliente@example.com", Phone = "11999999999" });
            var delivery = new CheckoutRequest {
                PostalCode = "01310100", Street = "Avenida Paulista", Number = "100", Neighborhood = "Bela Vista",
                City = "São Paulo", State = "SP", ExpectedTotal = 33.80m, PaymentSimulation = "declined",
            };
            Func<Task> refused = () => shop.Checkout(cart.Id, delivery);
            (await refused.Should().ThrowAsync<ShopException>()).Which.Status.Should().Be(422);
            (await db.Orders.CountAsync()).Should().Be(0);
            (await shop.GetCart(cart.Id)).Items.Single().Quantity.Should().Be(2);
            delivery.PaymentSimulation = "approved";
            var order = await shop.Checkout(cart.Id, delivery);
            (await shop.Checkout(cart.Id, delivery)).Id.Should().Be(order.Id);
            await shop.SaveProduct(product.Id, new ProductRequest {
                Name = "Produto atualizado", Description = "Descrição atualizada depois da compra.", Price = 20m, ImageUrl = "/images/morango.svg",
            });
            var receipt = await new ContactService(db).ReceiveAsync(new ContactMessageRequest {
                Name = "Cliente Teste", Email = "contato@example.com", Subject = "Contato PostgreSQL", Message = "Mensagem persistida no PostgreSQL de teste.",
            });
            await using var reloaded = new PostgresChallengeUvaContext(options);
            var persisted = await new ShopService(reloaded).GetOrder(cart.Id);
            persisted.Total.Should().Be(33.80m); persisted.Items.Single().ProductName.Should().Be("Cupcake PostgreSQL");
            persisted.Items.Single().UnitPrice.Should().Be(16.90m); persisted.CreatedAt.Kind.Should().Be(DateTimeKind.Utc);
            (await reloaded.ContactMessages.SingleAsync()).Id.Should().Be(receipt.Id);
            var next = await shop.CreateCart(cart.Id);
            await shop.SetQuantity(next.Id, product.Id, new CartItemRequest { Quantity = 1 });
            await shop.SetQuantity(next.Id, product.Id, new CartItemRequest { Quantity = 0 });
            (await shop.GetCart(next.Id)).Items.Should().BeEmpty();
            await shop.DeleteProduct(product.Id);
            (await shop.Products()).Should().BeEmpty();
        }
        finally
        {
            // Only the generated test schema is removed; no database is dropped.
            NpgsqlConnection.ClearAllPools();
            await using var command = new NpgsqlCommand($"DROP SCHEMA \"{schema}\" CASCADE", connection);
            await command.ExecuteNonQueryAsync();
        }
    }
}
