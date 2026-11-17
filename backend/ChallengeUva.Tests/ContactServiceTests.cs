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
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Xunit;

namespace ChallengeUva.Tests;

public class ContactServiceTests : IDisposable
{
    private readonly SqliteConnection connection = new("Data Source=:memory:");
    private readonly DbContextOptions<ChallengeUvaContext> options;
    private readonly ChallengeUvaContext db;
    public ContactServiceTests()
    {
        connection.Open();
        options = new DbContextOptionsBuilder<ChallengeUvaContext>().UseSqlite(connection).Options;
        db = new ChallengeUvaContext(options);
    }
    public void Dispose() { db.Dispose(); connection.Dispose(); }
    private static ContactMessageRequest Message() => new() {
        Name = " Ana Silva ", Email = " ANA@EXAMPLE.COM ", Subject = " Dúvida sobre cupcakes ",
        Message = " Gostaria de saber mais sobre os sabores. ",
    };

    [Fact] public async Task PersistsMessageAndReturnsReceiptOnlyAfterSave()
    {
        await db.Database.MigrateAsync();
        var receipt = await new ContactService(db).ReceiveAsync(Message());
        receipt.Id.Should().BeGreaterThan(0);
        receipt.Confirmation.Should().Contain("recebida com sucesso");
        using var other = new ChallengeUvaContext(options);
        var saved = await other.ContactMessages.SingleAsync();
        saved.Id.Should().Be(receipt.Id); saved.Name.Should().Be("Ana Silva");
        saved.Email.Should().Be("ana@example.com"); saved.Subject.Should().Be("Dúvida sobre cupcakes");
        saved.Message.Should().Be("Gostaria de saber mais sobre os sabores.");
        saved.CreatedAt.Kind.Should().Be(DateTimeKind.Utc);
    }

    [Theory]
    [InlineData("Name", " ")]
    [InlineData("Name", "A")]
    [InlineData("Email", "invalid")]
    [InlineData("Email", "")]
    [InlineData("Subject", " ")]
    [InlineData("Message", "\n \t")]
    public async Task RejectsInvalidFieldsWithoutSaving(string field, string value)
    {
        await db.Database.MigrateAsync();
        var request = Message(); typeof(ContactMessageRequest).GetProperty(field)!.SetValue(request, value);
        Func<Task> action = () => new ContactService(db).ReceiveAsync(request);
        (await action.Should().ThrowAsync<ShopException>()).Which.Status.Should().Be(400);
        (await db.ContactMessages.CountAsync()).Should().Be(0);
    }

    [Theory]
    [InlineData("Name", 101)] [InlineData("Email", 255)]
    [InlineData("Subject", 151)] [InlineData("Message", 3001)]
    public async Task RejectsOversizedFields(string field, int length)
    {
        await db.Database.MigrateAsync();
        var request = Message(); typeof(ContactMessageRequest).GetProperty(field)!.SetValue(request, new string('x', length));
        Func<Task> action = () => new ContactService(db).ReceiveAsync(request);
        await action.Should().ThrowAsync<ShopException>();
        (await db.ContactMessages.CountAsync()).Should().Be(0);
    }

    [Fact] public async Task MigrationAddsContactTableWithoutRemovingExistingShopData()
    {
        await db.Database.GetService<IMigrator>().MigrateAsync("20261117152643_GourmetShop");
        db.Products.Add(new Product { Name = "Produto existente", Description = "Descrição preservada", Price = 19.90m, ImageUrl = "/images/morango.svg" });
        await db.SaveChangesAsync();
        await db.Database.MigrateAsync();
        (await db.Products.AsNoTracking().SingleAsync()).Price.Should().Be(19.90m);
        await new ContactService(db).ReceiveAsync(Message());
        (await db.ContactMessages.CountAsync()).Should().Be(1);
    }
}
