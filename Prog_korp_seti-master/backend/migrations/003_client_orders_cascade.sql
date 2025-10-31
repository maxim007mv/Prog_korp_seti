-- Миграция 003: Добавление связи Client-Order и таблицы AdminLogs
-- Дата: 2025-01-24
-- Описание: Добавляет прямую связь между заказами и клиентами с каскадным удалением,
--           создает таблицу логов административных операций

BEGIN;

-- 1. Создание таблицы admin_logs для аудита всех операций
CREATE TABLE IF NOT EXISTS admin_logs (
    log_id SERIAL PRIMARY KEY,
    admin_id INTEGER,
    admin_username VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
    entity_type VARCHAR(50) NOT NULL, -- Order, Booking, Client, Dish, etc.
    entity_id INTEGER,
    entity_data JSONB, -- JSON snapshot данных до удаления/изменения
    comment TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_admin_logs_admin FOREIGN KEY (admin_id) 
        REFERENCES users(user_id) ON DELETE SET NULL
);

-- Индексы для быстрого поиска логов
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_entity_type ON admin_logs(entity_type);
CREATE INDEX idx_admin_logs_entity_id ON admin_logs(entity_id);
CREATE INDEX idx_admin_logs_timestamp ON admin_logs(timestamp DESC);
CREATE INDEX idx_admin_logs_type_action_time ON admin_logs(entity_type, action, timestamp DESC);

-- 2. Добавление поля client_id в таблицу orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS client_id INTEGER;

-- 3. Создание внешнего ключа с каскадным удалением
-- Сначала создаем индекс для производительности
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);

-- Добавляем constraint
ALTER TABLE orders
ADD CONSTRAINT fk_orders_client FOREIGN KEY (client_id)
    REFERENCES clients(client_id) ON DELETE CASCADE;

-- 4. Функция для автоматического удаления клиента, если у него больше нет активных заказов
CREATE OR REPLACE FUNCTION check_client_orders_after_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Если у клиента больше нет заказов, удаляем клиента
    IF OLD.client_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM orders 
            WHERE client_id = OLD.client_id 
            AND order_id != OLD.order_id
        ) THEN
            DELETE FROM clients WHERE client_id = OLD.client_id;
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 5. Триггер для автоматического удаления клиента при удалении последнего заказа
CREATE TRIGGER trg_check_client_orders_after_delete
AFTER DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION check_client_orders_after_delete();

-- 6. Функция для логирования удалений (опциональная, но рекомендуется)
CREATE OR REPLACE FUNCTION log_entity_deletion()
RETURNS TRIGGER AS $$
DECLARE
    admin_user VARCHAR(100);
BEGIN
    -- Попытка получить текущего пользователя (если доступно через session)
    admin_user := current_user;
    
    -- Логируем удаление
    INSERT INTO admin_logs (
        admin_username,
        action,
        entity_type,
        entity_id,
        entity_data,
        comment
    ) VALUES (
        admin_user,
        'DELETE',
        TG_TABLE_NAME,
        CASE TG_TABLE_NAME
            WHEN 'orders' THEN OLD.order_id
            WHEN 'bookings' THEN OLD.booking_id
            WHEN 'clients' THEN OLD.client_id
            ELSE NULL
        END,
        row_to_json(OLD),
        'Automatic deletion via trigger'
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 7. Триггеры для логирования удалений
CREATE TRIGGER trg_log_order_deletion
BEFORE DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_entity_deletion();

CREATE TRIGGER trg_log_booking_deletion
BEFORE DELETE ON bookings
FOR EACH ROW
EXECUTE FUNCTION log_entity_deletion();

CREATE TRIGGER trg_log_client_deletion
BEFORE DELETE ON clients
FOR EACH ROW
EXECUTE FUNCTION log_entity_deletion();

-- 8. Обновление существующих заказов: связываем с клиентами через bookings
UPDATE orders o
SET client_id = b.client_id
FROM bookings b
WHERE o.booking_id = b.booking_id 
  AND b.client_id IS NOT NULL
  AND o.client_id IS NULL;

-- 9. Комментарии для документации
COMMENT ON TABLE admin_logs IS 'Журнал административных операций (CREATE, UPDATE, DELETE)';
COMMENT ON COLUMN admin_logs.entity_data IS 'JSON снимок данных сущности до изменения/удаления';
COMMENT ON COLUMN orders.client_id IS 'Прямая связь с клиентом (с каскадным удалением)';
COMMENT ON FUNCTION check_client_orders_after_delete() IS 'Автоматически удаляет клиента, если у него не осталось заказов';
COMMENT ON FUNCTION log_entity_deletion() IS 'Логирует все удаления в admin_logs';

COMMIT;

-- Проверка миграции
-- SELECT COUNT(*) FROM admin_logs;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'client_id';
