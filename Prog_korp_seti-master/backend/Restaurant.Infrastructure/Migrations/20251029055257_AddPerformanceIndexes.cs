using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Restaurant.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "idx_orders_analytics",
                table: "orders",
                columns: new[] { "status", "end_time" },
                filter: "status = 'завершен'");

            migrationBuilder.CreateIndex(
                name: "idx_orders_waiter_status_date",
                table: "orders",
                columns: new[] { "waiter_id", "status", "shift_date" });

            migrationBuilder.CreateIndex(
                name: "idx_dishes_menu",
                table: "dishes",
                columns: new[] { "is_available", "is_deleted", "category_id" },
                filter: "is_available = true AND is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "idx_bookings_search",
                table: "bookings",
                columns: new[] { "client_name", "client_phone", "status" });

            migrationBuilder.CreateIndex(
                name: "idx_bookings_table_status_time",
                table: "bookings",
                columns: new[] { "table_id", "status", "start_time", "end_time" },
                filter: "status = 'активно'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_orders_analytics",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "idx_orders_waiter_status_date",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "idx_dishes_menu",
                table: "dishes");

            migrationBuilder.DropIndex(
                name: "idx_bookings_search",
                table: "bookings");

            migrationBuilder.DropIndex(
                name: "idx_bookings_table_status_time",
                table: "bookings");
        }
    }
}
