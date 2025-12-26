using System.Text.Json;
using Npgsql;

var connectionString = "Host=localhost;Port=5432;Database=restaurant;Username=postgres;Password=postgres123";

// Read JSON
var json = await File.ReadAllTextAsync(@"D:\korporative_system\parsed_dishes.json");
var dishes = JsonSerializer.Deserialize<List<DishJson>>(json);

if (dishes == null || dishes.Count == 0)
{
    Console.WriteLine("No dishes found in JSON");
    return;
}

// Category mapping
var categoryMap = new Dictionary<string, int>
{
    ["Салаты"] = 0,
    ["Холодные закуски"] = 1,
    ["Горячие закуски"] = 2,
    ["Горячие блюда"] = 3,
    ["Десерты"] = 4
};

await using var conn = new NpgsqlConnection(connectionString);
await conn.OpenAsync();

int inserted = 0;
int skipped = 0;

foreach (var dish in dishes)
{
    try
    {
        if (!categoryMap.TryGetValue(dish.category_name, out var categoryId))
        {
            Console.WriteLine($"Unknown category: {dish.category_name} for dish {dish.dish_name}");
            skipped++;
            continue;
        }

        var tags = dish.tags != null ? string.Join("|", dish.tags) : "";

        var sql = @"
            INSERT INTO ""Dishes"" 
            (""Name"", ""Composition"", ""Weight"", ""Price"", ""Category"", ""CookingTime"", ""Tags"", ""IsDeleted"")
            VALUES 
            (@name, @composition, @weight, @price, @category, @cookingTime, @tags, false)";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("name", dish.dish_name);
        cmd.Parameters.AddWithValue("composition", dish.composition ?? "");
        cmd.Parameters.AddWithValue("weight", dish.weight ?? "0");
        cmd.Parameters.AddWithValue("price", dish.price);
        cmd.Parameters.AddWithValue("category", categoryId);
        cmd.Parameters.AddWithValue("cookingTime", dish.cooking_time);
        cmd.Parameters.AddWithValue("tags", tags);

        var rows = await cmd.ExecuteNonQueryAsync();
        if (rows > 0)
        {
            inserted++;
            if (inserted % 10 == 0)
                Console.WriteLine($"Inserted {inserted} dishes...");
        }
        else
        {
            skipped++;
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error inserting {dish.dish_name}: {ex.Message}");
        skipped++;
    }
}

Console.WriteLine($"\nCompleted! Inserted: {inserted}, Skipped: {skipped}");

public class DishJson
{
    public string dish_name { get; set; } = "";
    public string? composition { get; set; }
    public string? weight { get; set; }
    public decimal price { get; set; }
    public string category_name { get; set; } = "";
    public int cooking_time { get; set; }
    public List<string>? tags { get; set; }
    public string? image_url { get; set; }
}
