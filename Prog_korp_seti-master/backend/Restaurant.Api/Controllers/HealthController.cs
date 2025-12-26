using Microsoft.AspNetCore.Mvc;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "ok",
            timestamp = DateTime.UtcNow,
            message = "Backend API is running"
        });
    }
}
