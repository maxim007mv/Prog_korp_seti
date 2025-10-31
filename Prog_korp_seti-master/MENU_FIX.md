# Исправление меню - DTO вместо анонимных типов

## Проблема
Фронтенд не отображал блюда, потому что API возвращал **сырые entities из базы данных** вместо **спроецированных DTO**.

### Симптомы
- API возвращал 200 OK с 1022 блюдами
- Но структура данных не соответствовала ожиданиям фронтенда:
  ```json
  // ❌ Что возвращал API (сырые entities):
  {
    "categoryId": 6,           // число вместо строки
    "isAvailable": true,       // лишнее поле
    "isDeleted": false,        // лишнее поле
    "createdAt": "2025-10-23", // лишнее поле
    "updatedAt": "2025-10-23"  // лишнее поле
  }
  
  // ✅ Что ожидал фронтенд (DTO):
  {
    "category": "Напитки",     // строка с названием категории
    "categoryId": 6,
    "tags": ["Холодный"]       // массив тегов
  }
  ```

### Корневая причина
В `MenuController.cs` была написана проекция с анонимным типом:
```csharp
.Select(d => new {
    category = d.Category.CategoryName,  // строка
    tags = d.Types.Select(t => t.TypeName).ToArray()  // массив
})
```

Но **EF Core + System.Text.Json** игнорировали эту проекцию и сериализовали **сырые entities** с навигационными свойствами.

## Решение
Создал **явные DTO классы** и заменил анонимные типы на типизированные объекты.

### 1. Создан файл DTOs
**Файл:** `backend/Restaurant.Application/DTOs/MenuDto.cs`

```csharp
public class DishDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Composition { get; set; }
    public string Weight { get; set; }
    public decimal Price { get; set; }
    public string Category { get; set; }  // ← строка, не ID!
    public int CategoryId { get; set; }
    public int CookingTime { get; set; }
    public string[] Tags { get; set; }     // ← массив, не навигационное свойство!
    public string? ImageUrl { get; set; }
}

public class MenuDto
{
    public string[] Categories { get; set; }
    public List<DishDto> Dishes { get; set; }
}
```

### 2. Обновлен MenuController
**Файл:** `backend/Restaurant.Api/Controllers/MenuController.cs`

**Изменения:**
1. Добавлен using:
   ```csharp
   using Restaurant.Application.DTOs;
   ```

2. Заменен анонимный тип на `DishDto`:
   ```csharp
   // ❌ Было:
   .Select(d => new {
       category = d.Category != null ? d.Category.CategoryName : "Unknown",
       tags = d.Types != null ? d.Types.Select(t => t.TypeName).ToArray() : Array.Empty<string>()
   })
   
   // ✅ Стало:
   .Select(d => new DishDto {
       Id = d.Id,
       Name = d.Name,
       Composition = d.Composition,
       Weight = d.Weight,
       Price = d.Price,
       Category = d.Category != null ? d.Category.CategoryName : "Unknown",
       CategoryId = d.CategoryId,
       CookingTime = d.CookingTime,
       Tags = d.Types != null ? d.Types.Select(t => t.TypeName).ToArray() : Array.Empty<string>(),
       ImageUrl = d.ImageUrl
   })
   ```

3. Заменен анонимный объект результата на `MenuDto`:
   ```csharp
   // ❌ Было:
   var result = new { categories, dishes };
   
   // ✅ Стало:
   var result = new MenuDto
   {
       Categories = categories.ToArray(),
       Dishes = dishes
   };
   ```

## Результат
✅ **API теперь возвращает правильную структуру:**
```json
{
  "categories": ["Десерты", "Горячие блюда", "Салаты", "Холодные закуски", "Горячие закуски", "Напитки"],
  "dishes": [
    {
      "id": 316,
      "name": "A. J.",
      "composition": "Applejack — 1 1/2 унций, Grapefruit juice — 1 унций",
      "weight": "120",
      "price": 444.50,
      "category": "Напитки",     // ← строка!
      "categoryId": 6,
      "cookingTime": 8,
      "tags": [],                 // ← массив!
      "imageUrl": "https://example.com/image.jpg"
    }
  ]
}
```

✅ **1022 блюда загружаются корректно**
✅ **Категории и теги в правильном формате**
✅ **Фронтенд теперь может отображать меню**

## Технические детали
- **Причина исходной проблемы:** EF Core не гарантирует, что анонимные типы будут корректно сериализованы в JSON
- **Почему DTO решает проблему:** Явные типы обеспечивают предсказуемую сериализацию через System.Text.Json
- **Производительность:** Проекция происходит на уровне БД (LINQ to SQL), поэтому не загружаются лишние данные
- **Кэширование:** После обновления кода нужно перезапустить backend, чтобы очистить `IMemoryCache` (время жизни: 10 минут)

## Запуск после исправления
```powershell
# 1. Остановить старые процессы
Stop-Process -Name "Restaurant.Api" -Force -ErrorAction SilentlyContinue

# 2. Пересобрать backend
cd backend
dotnet build

# 3. Запустить backend
cd Restaurant.Api
dotnet run

# 4. Запустить frontend (в другом терминале)
cd ../../
npm run dev
```

## Проверка
```powershell
# Проверить структуру ответа API
curl http://localhost:3001/api/menu | ConvertFrom-Json | Select-Object categories, @{Name='dishCount'; Expression={$_.dishes.Count}}

# Проверить первое блюдо
curl http://localhost:3001/api/menu | ConvertFrom-Json | Select-Object -ExpandProperty dishes | Select-Object -First 1

# Открыть меню в браузере
Start-Process "http://localhost:3000/menu"
```

---
**Дата исправления:** 18:41, 24 января 2025
**Затронутые файлы:**
- `backend/Restaurant.Application/DTOs/MenuDto.cs` (создан)
- `backend/Restaurant.Api/Controllers/MenuController.cs` (обновлен)
