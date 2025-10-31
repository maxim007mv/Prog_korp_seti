-- Исправление функции логирования триггера
-- Проблема: OLD.order_id не находится в контексте триггера

BEGIN;

-- 1. Удаляем все триггеры логирования
DROP TRIGGER IF EXISTS trg_log_order_deletion ON orders;
DROP TRIGGER IF EXISTS trg_log_booking_deletion ON bookings;
DROP TRIGGER IF EXISTS trg_log_client_deletion ON clients;

-- 2. Удаляем старую функцию
DROP FUNCTION IF EXISTS log_entity_deletion() CASCADE;

-- 3. Создаем новую функцию без логирования orders (они логируются в коде)
CREATE OR REPLACE FUNCTION log_entity_deletion()
RETURNS TRIGGER AS $$
DECLARE
    admin_user VARCHAR(100);
    entity_id_value INTEGER;
BEGIN
    admin_user := current_user;
    
    -- Получаем ID сущности в зависимости от таблицы
    IF TG_TABLE_NAME = 'bookings' THEN
        entity_id_value := OLD.booking_id;
    ELSIF TG_TABLE_NAME = 'clients' THEN
        entity_id_value := OLD.client_id;
    ELSE
        entity_id_value := NULL;
    END IF;
    
    -- Логируем только bookings и clients
    IF TG_TABLE_NAME IN ('bookings', 'clients') THEN
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
            entity_id_value,
            row_to_json(OLD),
            'Automatic deletion via trigger'
        );
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 4. Создаем триггеры только для bookings и clients
CREATE TRIGGER trg_log_booking_deletion
BEFORE DELETE ON bookings
FOR EACH ROW
EXECUTE FUNCTION log_entity_deletion();

CREATE TRIGGER trg_log_client_deletion
BEFORE DELETE ON clients
FOR EACH ROW
EXECUTE FUNCTION log_entity_deletion();

COMMIT;

-- Проверка
SELECT 'Triggers fixed successfully' as status;
