using ChallengeUva.Application.Services;
using ChallengeUva.Domain.Requests;
using Microsoft.AspNetCore.Mvc;

namespace ChallengeUva.Api.Controllers;

[ApiController, Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly ShopService shop;
    public ProductsController(ShopService shop) => this.shop = shop;
    [HttpGet] public async Task<IActionResult> List() => Ok(await shop.Products());
    [HttpGet("{id:int}")] public async Task<IActionResult> Get(int id) => Ok(await shop.GetProduct(id));
    [HttpPost] public async Task<IActionResult> Create(ProductRequest request)
    {
        var product = await shop.SaveProduct(null, request);
        return Created($"/api/products/{product.Id}", product);
    }
    [HttpPut("{id:int}")] public async Task<IActionResult> Update(int id, ProductRequest request) => Ok(await shop.SaveProduct(id, request));
    [HttpDelete("{id:int}")] public async Task<IActionResult> Delete(int id) { await shop.DeleteProduct(id); return NoContent(); }
}

[ApiController, Route("api/carts")]
public class CartsController : ControllerBase
{
    private readonly ShopService shop;
    public CartsController(ShopService shop) => this.shop = shop;
    [HttpPost] public async Task<IActionResult> Create([FromQuery] Guid? previousCartId)
    {
        var cart = await shop.CreateCart(previousCartId); return Created($"/api/carts/{cart.Id}", cart);
    }
    [HttpGet("{id:guid}")] public async Task<IActionResult> Get(Guid id) => Ok(await shop.GetCart(id));
    [HttpPut("{id:guid}/items/{productId:int}")]
    public async Task<IActionResult> SetQuantity(Guid id, int productId, CartItemRequest request) => Ok(await shop.SetQuantity(id, productId, request));
    [HttpPut("{id:guid}/customer")]
    public async Task<IActionResult> Customer(Guid id, CustomerRequest request) => Ok(await shop.RegisterCustomer(id, request));
    [HttpPost("{id:guid}/checkout")]
    public async Task<IActionResult> Checkout(Guid id, CheckoutRequest request) => Ok(await shop.Checkout(id, request));
    [HttpGet("{id:guid}/order")]
    public async Task<IActionResult> Order(Guid id) => Ok(await shop.GetOrder(id));
}
