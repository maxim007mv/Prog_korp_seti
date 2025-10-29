# AI Agent Instructions - Restaurant Management System

## Architecture Overview

**Hybrid Stack:** Next.js 14 (frontend) + .NET 8 Web API (backend) + PostgreSQL + DeepSeek AI
- Frontend: `http://localhost:3000` (React, TypeScript, TailwindCSS, TanStack Query v5)
- Backend: `http://localhost:3001/api` (.NET 8, EF Core, JWT auth)
- Database: PostgreSQL on `localhost:5432` (database: `restaurant_db`)

**Project Structure:**
```
├── app/                    # Next.js App Router pages
├── components/features/    # Feature-based React components
├── lib/api/               # API client, hooks, endpoints
├── types/                 # TypeScript interfaces
└── backend/
    ├── Restaurant.Api/         # ASP.NET Core Web API
    ├── Restaurant.Domain/      # Entity models, enums
    └── Restaurant.Infrastructure/ # EF Core, persistence
```

## Critical Data Contract: PascalCase vs camelCase

**Frontend sends PascalCase to .NET backend, receives camelCase:**
```typescript
// ✅ Correct: BookingCreate uses PascalCase for .NET DTOs
export interface BookingCreate {
  TableId: number;        // NOT tableId
  ClientName: string;     // NOT clientName
  ClientPhone: string;
  StartTime: string;
  EndTime: string;
}

// ✅ Correct: Response from backend is camelCase
export interface Booking {
  id: number;            // lowercase
  clientName: string;
  tableId: number;
}
```

**Why:** .NET controllers use `System.Text.Json` with default camelCase serialization for responses, but DTOs expect PascalCase input. See `types/booking.ts` lines 30-39.

## Development Workflow

### Quick Start (Both Services)
```bash
# Terminal 1: Backend (.NET)
cd backend/Restaurant.Api
dotnet run  # Starts on http://localhost:3001

# Terminal 2: Frontend (Next.js)
npm run dev  # Starts on http://localhost:3000

# Terminal 3: Generate test data (250 orders, 10M RUB revenue)
cd backend/GenerateTestData
dotnet run
```

### Database Management
```bash
# Apply EF Core migrations (from backend/ directory)
dotnet ef database update --project Restaurant.Infrastructure --startup-project Restaurant.Api

# Create new migration
dotnet ef migrations add MigrationName --project Restaurant.Infrastructure --startup-project Restaurant.Api
```

**DO NOT** use `database_schema.sql` directly - it conflicts with EF Core schema.

## Backend Patterns (.NET 8)

### Domain Layer Structure
- **Entities:** `Restaurant.Domain/Entities/` - Plain C# classes with navigation properties
- **Example:** `Order.TotalPrice` (NOT `TotalAmount`) maps to database column `total_price`
- **Enums:** Status values stored as strings: `"pending"`, `"completed"`, `"cancelled"` (lowercase)

### Controller Conventions
```csharp
// ✅ Route pattern: [Route("api/[controller]")]
[ApiController]
[Route("api/analytics")]  // NOT /reports or /api/reports
public class AnalyticsController : ControllerBase
{
    // Return DTO with renamed properties for frontend compatibility
    .Select(o => new {
        TotalAmount = o.TotalPrice,  // Rename domain property
        Items = (o.Items ?? new List<OrderItem>()).Select(...)  // Handle nulls
    })
}
```

### Critical Entity Mappings
| Frontend (TypeScript) | Backend Entity (.NET) | Database Column |
|-----------------------|-----------------------|-----------------|
| `totalAmount`         | `Order.TotalPrice`    | `total_price`   |
| `number`              | `Table.Location`      | `location`      |
| `capacity`            | `Table.Seats`         | `seats`         |
| `isAvailable`         | `Table.IsActive`      | `is_active`     |

See `backend/Restaurant.Domain/Entities/` for full entity definitions.

## Frontend Patterns (Next.js 14)

### API Client Architecture
```typescript
// lib/api/client.ts - Centralized HTTP client
const apiClient = new ApiClient();  // Auto-configures from NEXT_PUBLIC_API_BASE_URL

// lib/api/endpoints.ts - Type-safe API definitions
export const bookingsApi = {
  create: (data: BookingCreate) => apiClient.post('/bookings', data),
  search: (params: BookingSearchParams) => apiClient.get('/bookings/search', params),
};

// lib/hooks/useBookings.ts - React Query hooks
export const useCreateBooking = () => {
  return useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => queryClient.invalidateQueries(['bookings'])
  });
};
```

### DeepSeek AI Integration
- Real API calls to `https://api.deepseek.com/v1/chat/completions`
- API key in `.env.local`: `NEXT_PUBLIC_DEEPSEEK_API_KEY`
- Implementation: `lib/ai/deepseek.ts` (NOT a mock)
- Used for: Smart menu search, upsell recommendations

## Common Pitfalls

1. **404 on `/api/analytics/*` endpoints:** Analytics routes changed from `/reports/*` to `/analytics/*` (see `lib/api/endpoints.ts` lines 60-65)

2. **Missing controllers:** If you get 404 on `/api/tables` or `/api/orders`, the controller file may not exist. Check `backend/Restaurant.Api/Controllers/` and create if needed.

3. **Build errors on `Order.TotalAmount`:** Use `Order.TotalPrice` instead (domain model property name)

4. **Nullable navigation properties:** Always use null-coalescing: `(o.Items ?? new List<OrderItem>())`

5. **Test data generation:** Run `backend/GenerateTestData/Program.cs` to seed 250 orders with ~10M RUB revenue distributed over 90 days for analytics testing.

6. **404 on booking creation:** Frontend must send PascalCase DTOs. Common mistake - sending `{tableId, clientName}` instead of `{TableId, ClientName}`. See `types/booking.ts` BookingCreate interface.

7. **Notifications endpoint:** Use `/api/notifications/latest` for notification bell widget, NOT `/api/notifications/unread`.

## Key Files Reference

- **API Routes:** `lib/api/endpoints.ts` - All backend endpoint definitions
- **Auth Flow:** `lib/hooks/useAuth.ts` + `backend/Restaurant.Api/Controllers/AuthController.cs`
- **Analytics:** `components/features/admin/RevenueChart.tsx` - Expects `{points: [], total: {}}` structure
- **Entity Models:** `backend/Restaurant.Domain/Entities/` - Source of truth for database schema
- **Test Credentials:** `admin@restaurant.com / admin123`, `waiter1@restaurant.com / waiter123`

## Environment Variables

```bash
# .env.local (frontend)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-f6e4ca3f948f4a96ba0926760f12c9d8

# appsettings.Development.json (backend)
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=restaurant_db;Username=postgres;Password=postgres"
}
```
