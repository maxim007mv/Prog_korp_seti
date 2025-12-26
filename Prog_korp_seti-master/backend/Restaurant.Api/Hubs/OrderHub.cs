using Microsoft.AspNetCore.SignalR;

namespace Restaurant.Api.Hubs;

public class OrderHub : Hub
{
    public async Task OrderCreated(int orderId, string tableLocation)
    {
        await Clients.All.SendAsync("ReceiveOrderCreated", new
        {
            orderId,
            tableLocation,
            timestamp = DateTime.UtcNow
        });
    }

    public async Task OrderStatusChanged(int orderId, string status)
    {
        await Clients.All.SendAsync("ReceiveOrderStatusChanged", new
        {
            orderId,
            status,
            timestamp = DateTime.UtcNow
        });
    }

    public async Task NewOrder(int orderId, int tableId, string tableName)
    {
        // Уведомить администраторов и официантов о новом заказе
        await Clients.Group("Admins").SendAsync("ReceiveNewOrder", new
        {
            orderId,
            tableId,
            tableName,
            timestamp = DateTime.UtcNow
        });

        await Clients.Group("Waiters").SendAsync("ReceiveNewOrder", new
        {
            orderId,
            tableId,
            tableName,
            timestamp = DateTime.UtcNow
        });
    }

    public async Task OrderReady(int orderId, int tableId)
    {
        // Уведомить официантов, что заказ готов
        await Clients.Group("Waiters").SendAsync("ReceiveOrderReady", new
        {
            orderId,
            tableId,
            timestamp = DateTime.UtcNow
        });
    }

    public async Task BookingCreated(int bookingId, string clientName, DateTime startTime)
    {
        await Clients.All.SendAsync("ReceiveBookingCreated", new
        {
            bookingId,
            clientName,
            startTime,
            timestamp = DateTime.UtcNow
        });
    }

    public async Task JoinRoleGroup(string role)
    {
        if (role == "администратор")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }
        else if (role == "официант")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Waiters");
        }
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
