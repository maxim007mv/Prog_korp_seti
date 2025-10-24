-- ============================================
-- Миграция 002: ИИ и Расширенная Аналитика
-- Дата: 23.10.2025
-- Описание: Добавление таблиц для ИИ-функционала и расширенной аналитики
-- ============================================

-- ============================================
-- ИИ И АНАЛИТИКА
-- ============================================

-- История ИИ-запросов
CREATE TABLE IF NOT EXISTS AiRequests (
    Id SERIAL PRIMARY KEY,
    UserId INT NOT NULL,
    RequestType VARCHAR(50) NOT NULL,
    Prompt TEXT NOT NULL,
    Response TEXT NOT NULL,
    ModelUsed VARCHAR(50) NOT NULL DEFAULT 'gpt-4-turbo',
    TokensUsed INT,
    ExecutionTimeMs INT,
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT CK_AiRequests_Type CHECK (RequestType IN ('digest', 'forecast', 'recommendation', 'chat')),
    CONSTRAINT FK_AiRequests_User FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS IX_AiRequests_UserId_CreatedAt ON AiRequests(UserId, CreatedAt DESC);
CREATE INDEX IF NOT EXISTS IX_AiRequests_Type ON AiRequests(RequestType);
CREATE INDEX IF NOT EXISTS IX_AiRequests_CreatedAt ON AiRequests(CreatedAt DESC);

COMMENT ON TABLE AiRequests IS 'История всех запросов к ИИ-сервису';
COMMENT ON COLUMN AiRequests.RequestType IS 'Тип запроса: digest, forecast, recommendation, chat';
COMMENT ON COLUMN AiRequests.TokensUsed IS 'Количество использованных токенов OpenAI';

-- ИИ-рекомендации
CREATE TABLE IF NOT EXISTS AiRecommendations (
    Id SERIAL PRIMARY KEY,
    Type VARCHAR(50) NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Content TEXT NOT NULL,
    ActionItems JSONB,
    ConfidenceScore DECIMAL(3,2),
    TargetRole VARCHAR(20),
    Priority INT DEFAULT 3,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    ExpiresAt TIMESTAMP,
    CONSTRAINT CK_AiRecommendations_Confidence CHECK (ConfidenceScore BETWEEN 0 AND 1),
    CONSTRAINT CK_AiRecommendations_Priority CHECK (Priority BETWEEN 1 AND 3),
    CONSTRAINT CK_AiRecommendations_Type CHECK (Type IN ('menu_optimization', 'pricing', 'staffing', 'inventory'))
);

CREATE INDEX IF NOT EXISTS IX_AiRecommendations_Role_CreatedAt ON AiRecommendations(TargetRole, CreatedAt DESC);
CREATE INDEX IF NOT EXISTS IX_AiRecommendations_IsRead ON AiRecommendations(IsRead, Priority);
CREATE INDEX IF NOT EXISTS IX_AiRecommendations_ExpiresAt ON AiRecommendations(ExpiresAt);

COMMENT ON TABLE AiRecommendations IS 'ИИ-рекомендации для оптимизации работы ресторана';
COMMENT ON COLUMN AiRecommendations.ConfidenceScore IS 'Уверенность ИИ в рекомендации (0-1)';
COMMENT ON COLUMN AiRecommendations.Priority IS '1=высокий, 2=средний, 3=низкий';

-- Прогнозы спроса на блюда
CREATE TABLE IF NOT EXISTS DishForecasts (
    Id SERIAL PRIMARY KEY,
    DishId INT NOT NULL,
    ForecastDate DATE NOT NULL,
    PredictedDemand INT NOT NULL,
    ActualDemand INT,
    ConfidenceScore DECIMAL(3,2),
    ModelVersion VARCHAR(20),
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT UQ_DishForecasts_Dish_Date UNIQUE (DishId, ForecastDate),
    CONSTRAINT FK_DishForecasts_Dish FOREIGN KEY (DishId) REFERENCES Dishes(Id) ON DELETE CASCADE,
    CONSTRAINT CK_DishForecasts_Confidence CHECK (ConfidenceScore BETWEEN 0 AND 1)
);

CREATE INDEX IF NOT EXISTS IX_DishForecasts_Date ON DishForecasts(ForecastDate);
CREATE INDEX IF NOT EXISTS IX_DishForecasts_DishId ON DishForecasts(DishId);

COMMENT ON TABLE DishForecasts IS 'Прогнозы спроса на блюда с помощью ML';
COMMENT ON COLUMN DishForecasts.ActualDemand IS 'Фактический спрос (заполняется постфактум для оценки точности)';

-- Ежедневные дайджесты
CREATE TABLE IF NOT EXISTS DailyDigests (
    Id SERIAL PRIMARY KEY,
    ShiftDate DATE NOT NULL UNIQUE,
    TotalRevenue DECIMAL(10,2),
    OrderCount INT,
    AverageCheck DECIMAL(10,2),
    TopDishes JSONB,
    BottomDishes JSONB,
    StaffPerformance JSONB,
    Summary TEXT,
    Forecast TEXT,
    Recommendations JSONB,
    Anomalies JSONB,
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IX_DailyDigests_ShiftDate ON DailyDigests(ShiftDate DESC);

COMMENT ON TABLE DailyDigests IS 'ИИ-дайджесты по итогам рабочего дня';
COMMENT ON COLUMN DailyDigests.Summary IS 'ИИ-сгенерированный анализ дня';
COMMENT ON COLUMN DailyDigests.Forecast IS 'Прогноз на следующий день';

-- ============================================
-- АНАЛИТИКА И МЕТРИКИ
-- ============================================

-- Сессии пользователей (для аудита)
CREATE TABLE IF NOT EXISTS UserSessions (
    Id SERIAL PRIMARY KEY,
    UserId INT NOT NULL,
    LoginAt TIMESTAMP NOT NULL DEFAULT NOW(),
    LogoutAt TIMESTAMP,
    IpAddress VARCHAR(45),
    UserAgent TEXT,
    DeviceType VARCHAR(20),
    SessionDurationMinutes INT GENERATED ALWAYS AS 
        (EXTRACT(EPOCH FROM (COALESCE(LogoutAt, NOW()) - LoginAt)) / 60)::INT STORED,
    CONSTRAINT FK_UserSessions_User FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT CK_UserSessions_DeviceType CHECK (DeviceType IN ('desktop', 'mobile', 'tablet', NULL))
);

CREATE INDEX IF NOT EXISTS IX_UserSessions_UserId_LoginAt ON UserSessions(UserId, LoginAt DESC);
CREATE INDEX IF NOT EXISTS IX_UserSessions_LoginAt ON UserSessions(LoginAt DESC);

COMMENT ON TABLE UserSessions IS 'История сессий пользователей для аудита и аналитики';

-- Расширенная аналитика заказов
CREATE TABLE IF NOT EXISTS OrderAnalytics (
    Id SERIAL PRIMARY KEY,
    OrderId INT NOT NULL UNIQUE,
    PreparationTimeMinutes INT,
    ServiceTimeMinutes INT,
    ItemCount INT,
    CustomerSatisfaction INT,
    WasTippedExtra BOOLEAN,
    PeakHourOrder BOOLEAN,
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT FK_OrderAnalytics_Order FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    CONSTRAINT CK_OrderAnalytics_Satisfaction CHECK (CustomerSatisfaction BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS IX_OrderAnalytics_OrderId ON OrderAnalytics(OrderId);
CREATE INDEX IF NOT EXISTS IX_OrderAnalytics_CreatedAt ON OrderAnalytics(CreatedAt DESC);

COMMENT ON TABLE OrderAnalytics IS 'Расширенная аналитика заказов';
COMMENT ON COLUMN OrderAnalytics.ServiceTimeMinutes IS 'Время от создания до закрытия заказа';

-- Аналитика меню
CREATE TABLE IF NOT EXISTS MenuAnalytics (
    Id SERIAL PRIMARY KEY,
    DishId INT NOT NULL,
    Date DATE NOT NULL,
    ViewCount INT DEFAULT 0,
    AddToCartCount INT DEFAULT 0,
    OrderCount INT DEFAULT 0,
    ConversionRate DECIMAL(5,2) GENERATED ALWAYS AS 
        (CASE WHEN ViewCount > 0 THEN (OrderCount::DECIMAL / ViewCount * 100) ELSE 0 END) STORED,
    CONSTRAINT UQ_MenuAnalytics_Dish_Date UNIQUE (DishId, Date),
    CONSTRAINT FK_MenuAnalytics_Dish FOREIGN KEY (DishId) REFERENCES Dishes(Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS IX_MenuAnalytics_Date ON MenuAnalytics(Date DESC);
CREATE INDEX IF NOT EXISTS IX_MenuAnalytics_DishId ON MenuAnalytics(DishId);

COMMENT ON TABLE MenuAnalytics IS 'Аналитика просмотров и конверсии блюд';
COMMENT ON COLUMN MenuAnalytics.ConversionRate IS 'Процент конверсии просмотров в заказы';

-- ============================================
-- ПЕРСОНАЛИЗАЦИЯ
-- ============================================

-- Предпочтения клиентов
CREATE TABLE IF NOT EXISTS ClientPreferences (
    Id SERIAL PRIMARY KEY,
    UserId INT NOT NULL UNIQUE,
    FavoriteDishes JSONB,
    DietaryRestrictions JSONB,
    AllergyInfo TEXT,
    PreferredCategories JSONB,
    SpicePreference INT DEFAULT 0,
    LastUpdated TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT FK_ClientPreferences_User FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT CK_ClientPreferences_SpiceLevel CHECK (SpicePreference BETWEEN 0 AND 3)
);

COMMENT ON TABLE ClientPreferences IS 'Предпочтения и ограничения клиентов';
COMMENT ON COLUMN ClientPreferences.SpicePreference IS 'Уровень остроты: 0=нет, 1=слабо, 2=средне, 3=очень остро';

-- История заказов клиентов (для ML)
CREATE TABLE IF NOT EXISTS ClientOrderHistory (
    Id SERIAL PRIMARY KEY,
    UserId INT NOT NULL,
    DishId INT NOT NULL,
    OrderedAt TIMESTAMP NOT NULL,
    Rating INT,
    RepeatOrder BOOLEAN DEFAULT FALSE,
    CONSTRAINT FK_ClientOrderHistory_User FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ClientOrderHistory_Dish FOREIGN KEY (DishId) REFERENCES Dishes(Id) ON DELETE CASCADE,
    CONSTRAINT CK_ClientOrderHistory_Rating CHECK (Rating BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS IX_ClientOrderHistory_UserId ON ClientOrderHistory(UserId, OrderedAt DESC);
CREATE INDEX IF NOT EXISTS IX_ClientOrderHistory_DishId ON ClientOrderHistory(DishId);

COMMENT ON TABLE ClientOrderHistory IS 'История заказов клиентов для персонализации';

-- ============================================
-- УВЕДОМЛЕНИЯ
-- ============================================

CREATE TABLE IF NOT EXISTS Notifications (
    Id SERIAL PRIMARY KEY,
    UserId INT NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Message TEXT NOT NULL,
    ActionUrl VARCHAR(500),
    IsRead BOOLEAN DEFAULT FALSE,
    Priority INT DEFAULT 2,
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    ExpiresAt TIMESTAMP,
    CONSTRAINT FK_Notifications_User FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT CK_Notifications_Priority CHECK (Priority BETWEEN 1 AND 3),
    CONSTRAINT CK_Notifications_Type CHECK (Type IN ('ai_insight', 'booking', 'order_ready', 'promotion', 'system'))
);

CREATE INDEX IF NOT EXISTS IX_Notifications_UserId_IsRead ON Notifications(UserId, IsRead, CreatedAt DESC);
CREATE INDEX IF NOT EXISTS IX_Notifications_CreatedAt ON Notifications(CreatedAt DESC);
CREATE INDEX IF NOT EXISTS IX_Notifications_ExpiresAt ON Notifications(ExpiresAt);

COMMENT ON TABLE Notifications IS 'Система уведомлений для пользователей';
COMMENT ON COLUMN Notifications.Priority IS '1=срочно, 2=обычное, 3=низкий приоритет';

-- ============================================
-- РАСШИРЕНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ============================================

-- Расширение таблицы Users
ALTER TABLE Users 
ADD COLUMN IF NOT EXISTS LastLoginAt TIMESTAMP,
ADD COLUMN IF NOT EXISTS NotificationPreferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
ADD COLUMN IF NOT EXISTS Avatar VARCHAR(500);

COMMENT ON COLUMN Users.NotificationPreferences IS 'Настройки уведомлений пользователя';

-- Расширение таблицы Orders
ALTER TABLE Orders 
ADD COLUMN IF NOT EXISTS Source VARCHAR(20) DEFAULT 'staff',
ADD COLUMN IF NOT EXISTS CustomerFeedback TEXT,
ADD COLUMN IF NOT EXISTS Rating INT;

ALTER TABLE Orders
ADD CONSTRAINT IF NOT EXISTS CK_Orders_Rating CHECK (Rating BETWEEN 1 AND 5),
ADD CONSTRAINT IF NOT EXISTS CK_Orders_Source CHECK (Source IN ('staff', 'web', 'mobile', 'phone'));

COMMENT ON COLUMN Orders.Source IS 'Источник заказа: staff, web, mobile, phone';

-- Расширение таблицы Dishes
ALTER TABLE Dishes 
ADD COLUMN IF NOT EXISTS ViewCount INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS IsAiRecommended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS Popularity DECIMAL(3,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS DietaryTags JSONB;

ALTER TABLE Dishes
ADD CONSTRAINT IF NOT EXISTS CK_Dishes_Popularity CHECK (Popularity BETWEEN 0 AND 1);

COMMENT ON COLUMN Dishes.Popularity IS 'Показатель популярности блюда (0-1)';
COMMENT ON COLUMN Dishes.IsAiRecommended IS 'Блюдо рекомендовано ИИ для продвижения';
COMMENT ON COLUMN Dishes.DietaryTags IS 'Теги: vegan, gluten-free, halal, kosher и т.д.';

-- ============================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================

-- Функция для автоматического расчета популярности блюда
CREATE OR REPLACE FUNCTION update_dish_popularity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Dishes
    SET Popularity = LEAST(1.0, (
        SELECT COALESCE(
            (COUNT(*)::DECIMAL / 
            (SELECT GREATEST(1, COUNT(*)) FROM OrderItems WHERE CreatedAt > NOW() - INTERVAL '30 days') * 2),
            0.5
        )
        FROM OrderItems
        WHERE DishId = NEW.DishId
        AND CreatedAt > NOW() - INTERVAL '30 days'
    ))
    WHERE Id = NEW.DishId;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления популярности при добавлении позиции в заказ
DROP TRIGGER IF EXISTS trg_update_dish_popularity ON OrderItems;
CREATE TRIGGER trg_update_dish_popularity
AFTER INSERT ON OrderItems
FOR EACH ROW
EXECUTE FUNCTION update_dish_popularity();

-- Функция для автоматической очистки старых уведомлений
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM Notifications
    WHERE ExpiresAt < NOW()
    OR (IsRead = TRUE AND CreatedAt < NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- ============================================

-- Пример ИИ-рекомендации (демо)
INSERT INTO AiRecommendations (Type, Title, Content, ConfidenceScore, TargetRole, Priority)
VALUES 
('menu_optimization', 
 'Рекомендация: Обновить меню', 
 'На основе анализа за последние 30 дней, рекомендуется убрать из меню 3 блюда с низкой популярностью и добавить сезонные предложения.', 
 0.85, 
 'admin', 
 2)
ON CONFLICT DO NOTHING;

-- ============================================
-- ПРАВА ДОСТУПА
-- ============================================

-- Предоставление прав (настройте под вашего пользователя БД)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO restaurant_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO restaurant_app;

-- ============================================
-- ЗАВЕРШЕНИЕ МИГРАЦИИ
-- ============================================

-- Запись в лог миграций (если есть таблица migrations)
-- INSERT INTO migrations (version, description, applied_at)
-- VALUES ('002', 'AI and Advanced Analytics', NOW());

COMMIT;
