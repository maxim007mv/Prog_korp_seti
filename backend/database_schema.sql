-- ============================================
-- БАЗА ДАННЫХ: ИНТЕГРИРОВАННАЯ СИСТЕМА УПРАВЛЕНИЯ РЕСТОРАНОМ
-- Версия: 2.1 (Перевод статусов и ролей)
-- СУБД: PostgreSQL
-- ============================================

-- ============================================
-- МОДУЛЬ: ПОЛЬЗОВАТЕЛИ И АВТОРИЗАЦИЯ
-- ============================================

-- Таблица: Пользователи системы
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(200) UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('администратор', 'официант', 'клиент')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================
-- МОДУЛЬ: ОФИЦИАНТЫ
-- ============================================

CREATE TABLE waiters (
    waiter_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    hire_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_waiters_active ON waiters(is_active);
CREATE INDEX idx_waiters_user ON waiters(user_id);

-- ============================================
-- МОДУЛЬ: КЛИЕНТЫ
-- ============================================

CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(200),
    date_of_birth DATE,
    loyalty_points INT DEFAULT 0,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_user ON clients(user_id);

-- ============================================
-- МОДУЛЬ: СТОЛЫ И БРОНИРОВАНИЕ
-- ============================================

-- Таблица: Столы
CREATE TABLE tables (
    table_id SERIAL PRIMARY KEY,
    location VARCHAR(100) NOT NULL, -- у окна, у прохода, у выхода, в глубине
    seats INT NOT NULL CHECK (seats > 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tables_location ON tables(location);
CREATE INDEX idx_tables_seats ON tables(seats);
CREATE INDEX idx_tables_active ON tables(is_active);

-- Таблица: Бронирования
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    table_id INT NOT NULL,
    client_id INT,
    client_name VARCHAR(100) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    comment TEXT,
    status VARCHAR(20) DEFAULT 'активно' CHECK (status IN ('активно', 'завершено', 'отменено', 'конвертировано')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (table_id) REFERENCES tables(table_id),
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE SET NULL,
    
    -- Время окончания должно быть позже времени начала
    CONSTRAINT chk_booking_time_range CHECK (end_time > start_time),
    -- Длительность должна быть кратна 30 минутам
    CONSTRAINT chk_booking_duration CHECK (EXTRACT(EPOCH FROM (end_time - start_time)) % 1800 = 0)
);

CREATE INDEX idx_bookings_table ON bookings(table_id);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_phone ON bookings(client_phone);
CREATE INDEX idx_bookings_name ON bookings(client_name);
CREATE INDEX idx_bookings_time_range ON bookings(start_time, end_time);
CREATE INDEX idx_bookings_status ON bookings(status);
-- Индекс для поиска по последним 4 цифрам телефона
CREATE INDEX idx_bookings_phone_last4 ON bookings(RIGHT(client_phone, 4));

-- ============================================
-- МОДУЛЬ: МЕНЮ
-- ============================================

-- Таблица: Категории блюд
CREATE TABLE dish_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    display_order INT DEFAULT 0
);

CREATE INDEX idx_dish_categories_order ON dish_categories(display_order);

-- Предзаполнение категорий
INSERT INTO dish_categories (category_name, display_order) VALUES
    ('Напитки', 1),
    ('Салаты', 2),
    ('Холодные закуски', 3),
    ('Горячие закуски', 4),
    ('Супы', 5),
    ('Горячие блюда', 6),
    ('Десерты', 7);

-- Таблица: Типы/теги блюд
CREATE TABLE dish_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO dish_types (type_name) VALUES
    ('Острое'),
    ('Веганское'),
    ('Вегетарианское'),
    ('Халяль'),
    ('Кошерное'),
    ('Без глютена'),
    ('Без лактозы');

-- Таблица: Блюда
CREATE TABLE dishes (
    dish_id SERIAL PRIMARY KEY,
    dish_name VARCHAR(200) NOT NULL,
    composition TEXT, -- состав
    weight VARCHAR(50), -- формат: 100/20/50
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    category_id INT NOT NULL,
    cooking_time INT CHECK (cooking_time >= 0), -- время готовки в минутах
    is_available BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE, -- софт-удаление
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES dish_categories(category_id),
    
    -- Проверка формата веса
    CONSTRAINT chk_weight_format CHECK (weight ~ '^\d+(\/\d+)*$')
);

CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_available ON dishes(is_available);
CREATE INDEX idx_dishes_deleted ON dishes(is_deleted);
CREATE INDEX idx_dishes_price ON dishes(price);

-- Таблица: Связь блюд и типов (многие-ко-многим)
CREATE TABLE dish_type_links (
    dish_id INT NOT NULL,
    type_id INT NOT NULL,
    
    PRIMARY KEY (dish_id, type_id),
    FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES dish_types(type_id) ON DELETE CASCADE
);

-- ============================================
-- МОДУЛЬ: ЗАКАЗЫ
-- ============================================

-- Таблица: Заказы
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    table_id INT NOT NULL,
    waiter_id INT,
    booking_id INT, -- связь с бронированием
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    comment TEXT,
    total_price NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'активен' CHECK (status IN ('активен', 'готовится', 'готов', 'закрыт', 'отменен')),
    is_walk_in BOOLEAN DEFAULT FALSE, -- walk-in или по брони
    shift_date DATE DEFAULT CURRENT_DATE, -- дата смены для группировки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (table_id) REFERENCES tables(table_id),
    FOREIGN KEY (waiter_id) REFERENCES waiters(waiter_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    
    -- Валидация: закрывать можно только активный заказ
    CONSTRAINT chk_close_only_active CHECK (
        (status = 'закрыт' AND end_time IS NOT NULL) OR 
        (status != 'закрыт')
    )
);

CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_waiter ON orders(waiter_id);
CREATE INDEX idx_orders_booking ON orders(booking_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_start_time ON orders(start_time);
CREATE INDEX idx_orders_end_time ON orders(end_time);
CREATE INDEX idx_orders_shift_date ON orders(shift_date);
-- Составные индексы для отчетов
CREATE INDEX idx_orders_status_time ON orders(status, end_time);
CREATE INDEX idx_orders_waiter_status ON orders(waiter_id, status);
CREATE INDEX idx_orders_shift_waiter ON orders(shift_date, waiter_id, status);
CREATE INDEX idx_orders_closed_date ON orders(status, shift_date) WHERE status = 'закрыт';

-- Таблица: Позиции заказа
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    dish_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL, -- цена на момент заказа
    item_total NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * price) STORED,
    comment TEXT, -- комментарий к позиции (для кухни/гостя)
    status VARCHAR(20) DEFAULT 'заказано' CHECK (status IN ('заказано', 'готовится', 'готов', 'подано')),
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(dish_id)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_dish ON order_items(dish_id);
CREATE INDEX idx_order_items_status ON order_items(status);

-- ============================================
-- МОДУЛЬ: РАЗДЕЛЬНЫЕ СЧЕТА (ОПЦИОНАЛЬНО)
-- ============================================

-- Таблица: Раздельные счета
CREATE TABLE split_bills (
    split_bill_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    split_number INT NOT NULL, -- номер счета (1, 2, 3...)
    guest_name VARCHAR(100),
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ожидает' CHECK (status IN ('ожидает', 'оплачен')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    UNIQUE (order_id, split_number)
);

CREATE INDEX idx_split_bills_order ON split_bills(order_id);

-- Таблица: Позиции в раздельных счетах
CREATE TABLE split_bill_items (
    split_bill_item_id SERIAL PRIMARY KEY,
    split_bill_id INT NOT NULL,
    order_item_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0), -- количество из позиции
    
    FOREIGN KEY (split_bill_id) REFERENCES split_bills(split_bill_id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id) ON DELETE CASCADE
);

CREATE INDEX idx_split_bill_items_split ON split_bill_items(split_bill_id);
CREATE INDEX idx_split_bill_items_order_item ON split_bill_items(order_item_id);

-- ============================================
-- МОДУЛЬ: ИСТОРИЯ ПЕРЕНОСОВ ЗАКАЗОВ
-- ============================================

-- Таблица: История переносов заказов на другие столы
CREATE TABLE order_transfers (
    transfer_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    from_table_id INT NOT NULL,
    to_table_id INT NOT NULL,
    transferred_by INT, -- кто перенес (waiter/admin)
    reason TEXT,
    transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (from_table_id) REFERENCES tables(table_id),
    FOREIGN KEY (to_table_id) REFERENCES tables(table_id),
    FOREIGN KEY (transferred_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_order_transfers_order ON order_transfers(order_id);

-- ============================================
-- МОДУЛЬ: ПРЕДЗАКАЗЫ (ОПЦИОНАЛЬНО)
-- ============================================

-- Таблица: Предзаказы при бронировании
CREATE TABLE preorders (
    preorder_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL,
    dish_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(dish_id)
);

CREATE INDEX idx_preorders_booking ON preorders(booking_id);
CREATE INDEX idx_preorders_dish ON preorders(dish_id);

-- ============================================
-- МОДУЛЬ: ИИ И АНАЛИТИКА (ОПЦИОНАЛЬНО)
-- ============================================

-- Таблица: Запросы к ИИ
CREATE TABLE ai_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INT,
    request_type VARCHAR(50), -- recommendation, digest, forecast
    request_data JSONB,
    response_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_ai_requests_user ON ai_requests(user_id);
CREATE INDEX idx_ai_requests_type ON ai_requests(request_type);
CREATE INDEX idx_ai_requests_created ON ai_requests(created_at);

-- Таблица: Рекомендации ИИ
CREATE TABLE ai_recommendations (
    recommendation_id SERIAL PRIMARY KEY,
    order_id INT,
    dish_id INT,
    reason TEXT,
    confidence NUMERIC(3, 2), -- 0.00 - 1.00
    was_accepted BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(dish_id)
);

CREATE INDEX idx_ai_recommendations_order ON ai_recommendations(order_id);
CREATE INDEX idx_ai_recommendations_dish ON ai_recommendations(dish_id);

-- Таблица: Прогнозы спроса на блюда
CREATE TABLE dish_forecasts (
    forecast_id SERIAL PRIMARY KEY,
    dish_id INT NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_quantity INT,
    confidence NUMERIC(3, 2),
    actual_quantity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (dish_id) REFERENCES dishes(dish_id),
    UNIQUE (dish_id, forecast_date)
);

CREATE INDEX idx_dish_forecasts_dish ON dish_forecasts(dish_id);
CREATE INDEX idx_dish_forecasts_date ON dish_forecasts(forecast_date);

-- Таблица: Дневные дайджесты
CREATE TABLE daily_digests (
    digest_id SERIAL PRIMARY KEY,
    digest_date DATE NOT NULL UNIQUE,
    total_revenue NUMERIC(10, 2),
    total_orders INT,
    average_check NUMERIC(10, 2),
    top_dishes JSONB,
    summary TEXT,
    forecast_tomorrow TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_digests_date ON daily_digests(digest_date);

-- ============================================
-- МОДУЛЬ: АУДИТ
-- ============================================

-- Таблица: История изменений бронирований
CREATE TABLE booking_history (
    history_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('создано', 'обновлено', 'отменено')), -- 'создано', 'обновлено', 'отменено'
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by INT,
    old_value JSONB,
    new_value JSONB,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_booking_history_booking ON booking_history(booking_id);
CREATE INDEX idx_booking_history_changed_at ON booking_history(changed_at);

-- ============================================
-- ПРЕДСТАВЛЕНИЯ (VIEWS)
-- ============================================

-- Представление: Доступные столы
CREATE VIEW available_tables_view AS
SELECT 
    t.table_id,
    t.location,
    t.seats,
    t.is_active,
    COUNT(CASE WHEN b.status = 'активно' AND DATE(b.start_time) = CURRENT_DATE THEN 1 END) AS today_bookings_count
FROM tables t
LEFT JOIN bookings b ON t.table_id = b.table_id
WHERE t.is_active = TRUE
GROUP BY t.table_id;

-- Представление: Полная информация о заказах
CREATE VIEW orders_full_info AS
SELECT 
    o.order_id,
    o.table_id,
    t.location AS table_location,
    o.waiter_id,
    CONCAT(w.first_name, ' ', w.last_name) AS waiter_name,
    o.booking_id,
    o.start_time,
    o.end_time,
    o.status,
    o.total_price,
    COUNT(DISTINCT oi.dish_id) AS unique_dishes_count,
    SUM(oi.quantity) AS total_items_count
FROM orders o
LEFT JOIN tables t ON o.table_id = t.table_id
LEFT JOIN waiters w ON o.waiter_id = w.waiter_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id, t.location, w.first_name, w.last_name;

-- Представление: Статистика по блюдам
CREATE VIEW dish_statistics AS
SELECT 
    d.dish_id,
    d.dish_name,
    dc.category_name,
    d.price,
    COUNT(oi.order_item_id) AS times_ordered,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.item_total) AS total_revenue,
    ROUND(AVG(oi.quantity), 2) AS avg_quantity_per_order
FROM dishes d
LEFT JOIN dish_categories dc ON d.category_id = dc.category_id
LEFT JOIN order_items oi ON d.dish_id = oi.dish_id
LEFT JOIN orders o ON oi.order_id = o.order_id AND o.status = 'закрыт'
WHERE d.is_deleted = FALSE
GROUP BY d.dish_id, dc.category_name;

-- Представление: Статистика официантов
CREATE VIEW waiter_statistics AS
SELECT 
    w.waiter_id,
    CONCAT(w.first_name, ' ', w.last_name) AS waiter_name,
    COUNT(CASE WHEN o.status = 'закрыт' THEN 1 END) AS closed_orders_count,
    SUM(CASE WHEN o.status = 'закрыт' THEN o.total_price ELSE 0 END) AS total_revenue,
    ROUND(AVG(CASE WHEN o.status = 'закрыт' THEN o.total_price END), 2) AS avg_check,
    COUNT(CASE WHEN o.status IN ('активен', 'готовится', 'готов') THEN 1 END) AS active_orders_count,
    -- Статистика за текущую смену
    COUNT(CASE WHEN o.status = 'закрыт' AND o.shift_date = CURRENT_DATE THEN 1 END) AS today_closed_orders,
    SUM(CASE WHEN o.status = 'закрыт' AND o.shift_date = CURRENT_DATE THEN o.total_price ELSE 0 END) AS today_revenue
FROM waiters w
LEFT JOIN orders o ON w.waiter_id = o.waiter_id
WHERE w.is_active = TRUE
GROUP BY w.waiter_id;

-- ============================================
-- ФУНКЦИИ
-- ============================================

-- Функция: Проверка конфликта бронирований
CREATE OR REPLACE FUNCTION check_booking_conflict(
    p_table_id INT,
    p_start_time TIMESTAMP,
    p_end_time TIMESTAMP,
    p_booking_id INT DEFAULT NULL
) 
RETURNS BOOLEAN 
LANGUAGE plpgsql
AS $$
DECLARE
    conflict_count INT;
BEGIN
    SELECT COUNT(*) INTO conflict_count
    FROM bookings
    WHERE table_id = p_table_id
      AND status = 'активно'
      AND (p_booking_id IS NULL OR booking_id != p_booking_id)
      AND (
          (p_start_time >= start_time AND p_start_time < end_time) OR
          (p_end_time > start_time AND p_end_time <= end_time) OR
          (p_start_time <= start_time AND p_end_time >= end_time)
      );
    
    RETURN conflict_count = 0;
END;
$$;

-- Функция: Проверка возможности редактирования стола
CREATE OR REPLACE FUNCTION can_edit_table(p_table_id INT) 
RETURNS BOOLEAN 
LANGUAGE plpgsql
AS $$
DECLARE
    active_booking_count INT;
BEGIN
    SELECT COUNT(*) INTO active_booking_count
    FROM bookings
    WHERE table_id = p_table_id
      AND status = 'активно'
      AND end_time > CURRENT_TIMESTAMP;
    
    RETURN active_booking_count = 0;
END;
$$;

-- Функция: Обновление total_price заказа
CREATE OR REPLACE FUNCTION update_order_total_price()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE orders
    SET total_price = (
        SELECT COALESCE(SUM(item_total), 0)
        FROM order_items
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================
-- ТРИГГЕРЫ
-- ============================================

-- Триггер: Обновление total_price при изменении order_items
CREATE TRIGGER trg_order_items_insert
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total_price();

CREATE TRIGGER trg_order_items_update
AFTER UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total_price();

CREATE TRIGGER trg_order_items_delete
AFTER DELETE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total_price();

-- Триггер: Обновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tables_updated_at
BEFORE UPDATE ON tables
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_dishes_updated_at
BEFORE UPDATE ON dishes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Триггер: Аудит изменений бронирований
CREATE OR REPLACE FUNCTION audit_booking_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO booking_history (booking_id, action, old_value, new_value)
        VALUES (
            NEW.booking_id,
            'обновлено',
            row_to_json(OLD),
            row_to_json(NEW)
        );
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO booking_history (booking_id, action, new_value)
        VALUES (
            NEW.booking_id,
            'создано',
            row_to_json(NEW)
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_audit
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION audit_booking_changes();

-- Процедура: Закрыть заказ (с валидацией)
CREATE OR REPLACE FUNCTION close_order(
    p_order_id INT,
    p_closed_by INT
) RETURNS BOOLEAN AS $$
DECLARE
    v_order_status VARCHAR(20);
    v_total_price NUMERIC(10, 2);
BEGIN
    -- Проверяем статус заказа
    SELECT status, total_price INTO v_order_status, v_total_price
    FROM orders
    WHERE order_id = p_order_id;
    
    IF v_order_status IS NULL THEN
        RAISE EXCEPTION 'Заказ не найден';
    END IF;
    
    IF v_order_status != 'активен' AND v_order_status != 'готов' THEN
        RAISE EXCEPTION 'Можно закрывать только активные заказы. Текущий статус: %', v_order_status;
    END IF;
    
    -- Закрываем заказ
    UPDATE orders
    SET 
        status = 'закрыт',
        end_time = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE order_id = p_order_id;
    
    -- Если есть связанное бронирование, меняем его статус
    UPDATE bookings
    SET status = 'завершено'
    WHERE booking_id = (SELECT booking_id FROM orders WHERE order_id = p_order_id)
      AND status = 'активно';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Процедура: Добавить/обновить позицию в заказе (с учетом дубликатов)
CREATE OR REPLACE FUNCTION add_or_update_order_item(
    p_order_id INT,
    p_dish_id INT,
    p_quantity INT,
    p_comment TEXT DEFAULT NULL
)
RETURNS INT 
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_item_id INT;
    v_dish_price NUMERIC(10, 2);
    v_is_available BOOLEAN;
BEGIN
    -- Проверяем доступность блюда
    SELECT price, is_available INTO v_dish_price, v_is_available
    FROM dishes
    WHERE dish_id = p_dish_id AND is_deleted = FALSE;
    
    IF v_is_available IS NULL OR v_is_available = FALSE THEN
        RAISE EXCEPTION 'Блюдо недоступно для заказа';
    END IF;
    
    -- Проверяем, есть ли уже такое блюдо в заказе
    SELECT order_item_id INTO v_order_item_id
    FROM order_items
    WHERE order_id = p_order_id AND dish_id = p_dish_id;
    
    IF v_order_item_id IS NOT NULL THEN
        -- Обновляем количество существующей позиции
        UPDATE order_items
        SET 
            quantity = quantity + p_quantity,
            comment = COALESCE(p_comment, comment)
        WHERE order_item_id = v_order_item_id;
    ELSE
        -- Добавляем новую позицию
        INSERT INTO order_items (order_id, dish_id, quantity, price, comment)
        VALUES (p_order_id, p_dish_id, p_quantity, v_dish_price, p_comment)
        RETURNING order_item_id INTO v_order_item_id;
    END IF;
    
    RETURN v_order_item_id;
END;
$$;

-- Процедура: Получить KPI дашборда
CREATE OR REPLACE FUNCTION get_dashboard_kpi(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    today_revenue NUMERIC,
    today_orders_count BIGINT,
    today_avg_check NUMERIC,
    top_dish_name VARCHAR,
    top_dish_quantity BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH today_stats AS (
        SELECT 
            COALESCE(SUM(o.total_price), 0) AS revenue,
            COUNT(*) AS orders_count,
            ROUND(AVG(o.total_price), 2) AS avg_check
        FROM orders o
        WHERE o.status = 'закрыт'
          AND o.shift_date = p_date
    ),
    top_dish AS (
        SELECT 
            d.dish_name,
            SUM(oi.quantity) AS total_quantity
        FROM order_items oi
        JOIN dishes d ON oi.dish_id = d.dish_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status = 'закрыт'
          AND o.shift_date = p_date
        GROUP BY d.dish_id, d.dish_name
        ORDER BY total_quantity DESC
        LIMIT 1
    )
    SELECT 
        ts.revenue,
        ts.orders_count,
        ts.avg_check,
        td.dish_name,
        td.total_quantity
    FROM today_stats ts
    LEFT JOIN top_dish td ON TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ХРАНИМЫЕ ПРОЦЕДУРЫ
-- ============================================

-- Процедура: Получить расписание стола
CREATE OR REPLACE FUNCTION get_table_schedule(
    p_table_id INT,
    p_date DATE
)
RETURNS TABLE (
    hour_slot VARCHAR,
    booking_id INT,
    client_name VARCHAR,
    client_phone VARCHAR,
    status VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH hours AS (
        SELECT generate_series(9, 22) AS hour
    ),
    hour_ranges AS (
        SELECT 
            hour,
            (p_date + (hour || ' hours')::INTERVAL)::TIMESTAMP AS slot_start,
            (p_date + ((hour + 1) || ' hours')::INTERVAL)::TIMESTAMP AS slot_end
        FROM hours
    )
    SELECT 
        TO_CHAR(hr.slot_start, 'HH24:MI') || '-' || TO_CHAR(hr.slot_end, 'HH24:MI') AS hour_slot,
        b.booking_id,
        b.client_name,
        b.client_phone,
        b.status
    FROM hour_ranges hr
    LEFT JOIN bookings b ON 
        b.table_id = p_table_id AND
        b.status = 'активно' AND
        b.start_time < hr.slot_end AND
        b.end_time > hr.slot_start
    ORDER BY hr.hour;
END;
$$;

-- Процедура: Получить чек заказа (с группировкой по категориям и подитогами)
CREATE OR REPLACE FUNCTION get_order_receipt(p_order_id INT)
RETURNS TABLE (
    order_id INT,
    table_id INT,
    waiter_name VARCHAR,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    category_name VARCHAR,
    category_subtotal NUMERIC,
    dish_name VARCHAR,
    quantity INT,
    price NUMERIC,
    item_total NUMERIC,
    total_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH order_info AS (
        SELECT 
            o.order_id,
            o.table_id,
            CONCAT(w.first_name, ' ', w.last_name) AS waiter_name,
            o.start_time,
            o.end_time,
            o.total_price
        FROM orders o
        LEFT JOIN waiters w ON o.waiter_id = w.waiter_id
        WHERE o.order_id = p_order_id AND o.status = 'закрыт'
    ),
    category_subtotals AS (
        SELECT 
            dc.category_id,
            dc.category_name,
            SUM(oi.item_total) AS category_subtotal
        FROM order_items oi
        JOIN dishes d ON oi.dish_id = d.dish_id
        JOIN dish_categories dc ON d.category_id = dc.category_id
        WHERE oi.order_id = p_order_id
        GROUP BY dc.category_id, dc.category_name
    )
    SELECT 
        oi_data.order_id,
        oi_data.table_id,
        oi_data.waiter_name,
        oi_data.start_time,
        oi_data.end_time,
        cs.category_name,
        cs.category_subtotal,
        d.dish_name,
        oi.quantity,
        oi.price,
        oi.item_total,
        oi_data.total_price AS total_amount
    FROM order_items oi
    JOIN dishes d ON oi.dish_id = d.dish_id
    JOIN dish_categories dc ON d.category_id = dc.category_id
    JOIN category_subtotals cs ON dc.category_id = cs.category_id
    CROSS JOIN order_info oi_data
    WHERE oi.order_id = p_order_id
    ORDER BY dc.display_order, d.dish_name;
END;
$$ LANGUAGE plpgsql;

-- Процедура: Статистика официанта за период
CREATE OR REPLACE FUNCTION get_waiter_stats(
    p_waiter_id INT,
    p_date_from TIMESTAMP DEFAULT NULL,
    p_date_to TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
    closed_orders_count BIGINT,
    total_revenue NUMERIC,
    avg_check NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) AS closed_orders_count,
        SUM(o.total_price) AS total_revenue,
        ROUND(AVG(o.total_price), 2) AS avg_check
    FROM orders o
    WHERE o.waiter_id = p_waiter_id
      AND o.status = 'закрыт'
      AND (p_date_from IS NULL OR o.end_time >= p_date_from)
      AND (p_date_to IS NULL OR o.end_time <= p_date_to);
END;
$$;

-- Процедура: Получить выручку за период
CREATE OR REPLACE FUNCTION get_revenue_report(
    p_date_from DATE,
    p_date_to DATE
)
RETURNS TABLE (
    report_date DATE,
    closed_orders_count BIGINT,
    total_revenue NUMERIC,
    avg_check NUMERIC,
    median_check NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.shift_date AS report_date,
        COUNT(*) AS closed_orders_count,
        SUM(o.total_price) AS total_revenue,
        ROUND(AVG(o.total_price), 2) AS avg_check,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY o.total_price) AS median_check
    FROM orders o
    WHERE o.status = 'закрыт'
      AND o.shift_date >= p_date_from
      AND o.shift_date <= p_date_to
    GROUP BY o.shift_date
    ORDER BY report_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Процедура: Топ популярных блюд
CREATE OR REPLACE FUNCTION get_popular_dishes(
    p_date_from TIMESTAMP,
    p_date_to TIMESTAMP,
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    dish_id INT,
    dish_name VARCHAR,
    category_name VARCHAR,
    times_ordered BIGINT,
    total_quantity BIGINT,
    total_revenue NUMERIC,
    percentage NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH dish_stats AS (
        SELECT 
            d.dish_id,
            d.dish_name,
            dc.category_name,
            COUNT(oi.order_item_id) AS times_ordered,
            SUM(oi.quantity) AS total_quantity,
            SUM(oi.item_total) AS total_revenue
        FROM order_items oi
        JOIN dishes d ON oi.dish_id = d.dish_id
        JOIN dish_categories dc ON d.category_id = dc.category_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status = 'закрыт'
          AND o.end_time >= p_date_from
          AND o.end_time <= p_date_to
        GROUP BY d.dish_id, d.dish_name, dc.category_name
    ),
    total_orders AS (
        SELECT SUM(times_ordered) AS total
        FROM dish_stats
    )
    SELECT 
        ds.dish_id,
        ds.dish_name,
        ds.category_name,
        ds.times_ordered,
        ds.total_quantity,
        ds.total_revenue,
        ROUND((ds.times_ordered::NUMERIC / NULLIF(t.total, 0)) * 100, 2) AS percentage
    FROM dish_stats ds, total_orders t
    ORDER BY ds.total_quantity DESC
    LIMIT p_limit;
END;
$$;

-- ============================================
-- КОММЕНТАРИИ К ТАБЛИЦАМ
-- ============================================

COMMENT ON TABLE users IS 'Пользователи системы (администратор, официант, клиент)';
COMMENT ON TABLE waiters IS 'Официанты ресторана';
COMMENT ON TABLE clients IS 'Клиенты ресторана';
COMMENT ON TABLE tables IS 'Столы ресторана с информацией о расположении и вместимости';
COMMENT ON TABLE bookings IS 'Бронирования столов клиентами';
COMMENT ON TABLE dishes IS 'Блюда меню с составом, ценой и характеристиками';
COMMENT ON TABLE orders IS 'Заказы на столы';
COMMENT ON TABLE order_items IS 'Позиции заказов (блюда в заказе)';
COMMENT ON TABLE preorders IS 'Предзаказы при бронировании стола';
COMMENT ON TABLE ai_requests IS 'Запросы к ИИ для рекомендаций и аналитики';
COMMENT ON TABLE ai_recommendations IS 'Рекомендации ИИ для upsell';
COMMENT ON TABLE dish_forecasts IS 'Прогнозы спроса на блюда';
COMMENT ON TABLE daily_digests IS 'Дневные дайджесты с аналитикой';

-- ============================================
-- ПРИМЕРЫ ЗАПРОСОВ
-- ============================================

/*
-- Найти бронирование по имени и 4 последним цифрам телефона
SELECT * FROM bookings 
WHERE client_name = 'Макс' 
  AND RIGHT(client_phone, 4) = '3535'
  AND status = 'активно';

-- Получить расписание стола на день
SELECT * FROM get_table_schedule(1, '2025-10-20');

-- Проверить возможность редактирования стола
SELECT can_edit_table(1);

-- Получить чек заказа
SELECT * FROM get_order_receipt(123); -- (работает для o.status = 'закрыт')

-- Статистика официанта за сегодня
SELECT * FROM get_waiter_stats(5, CURRENT_DATE::TIMESTAMP, (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMP);

-- Отчет по выручке за последние 30 дней
SELECT * FROM get_revenue_report(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE);

-- Топ-10 популярных блюд за месяц
SELECT * FROM get_popular_dishes(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, 10);

-- Получить KPI дашборда за сегодня
SELECT * FROM get_dashboard_kpi(CURRENT_DATE);

-- Добавить блюдо в заказ (дубликаты автоматически суммируются)
SELECT add_or_update_order_item(123, 5, 2, 'Без лука');

-- Закрыть заказ
SELECT close_order(123, 1);

-- Доступные столы на 4 человек
SELECT * FROM tables 
WHERE seats >= 4 
  AND is_active = TRUE
  AND table_id NOT IN (
    SELECT table_id FROM bookings 
    WHERE status = 'активно' 
      AND start_time <= '2025-10-20 19:00:00'
      AND end_time > '2025-10-20 19:00:00'
  );
*/
