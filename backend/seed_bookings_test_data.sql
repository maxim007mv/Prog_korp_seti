-- ============================================
-- СКРИПТ ДЛЯ ЗАПОЛНЕНИЯ ТЕСТОВЫХ ДАННЫХ
-- Система бронирования с поиском по телефону
-- База данных: restaurant_db
-- ============================================

-- Очистка существующих тестовых данных (опционально)
-- DELETE FROM bookings WHERE booking_id > 0;
-- DELETE FROM tables WHERE table_id > 0;
-- ALTER SEQUENCE bookings_booking_id_seq RESTART WITH 1;
-- ALTER SEQUENCE tables_table_id_seq RESTART WITH 1;

-- ============================================
-- ЗАПОЛНЕНИЕ СТОЛОВ
-- ============================================

-- Вставка тестовых столов (если еще нет)
INSERT INTO tables (location, seats, is_active, created_at, updated_at) VALUES
    ('у окна', 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('у окна', 4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('в центре зала', 4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('в центре зала', 6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('у прохода', 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('у прохода', 4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('в глубине зала', 8, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('у выхода', 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('VIP зона', 6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('терраса', 4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ============================================
-- ЗАПОЛНЕНИЕ ТЕСТОВЫХ БРОНИРОВАНИЙ
-- ============================================

-- Тестовые данные для проверки поиска по телефону
-- Все бронирования на будущие даты для тестирования

-- 1. Макс - телефон заканчивается на 3535
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, comment, status, created_at, updated_at) VALUES
(
    1,
    'Макс',
    '+79123453535',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '18 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '20 hours',
    'Бронь у окна на двоих',
    'активно',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 2. Максим - телефон заканчивается на 3535 (тот же последние 4 цифры)
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, comment, status, created_at, updated_at) VALUES
(
    2,
    'Максим',
    '+79876543535',
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '19 hours',
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '21 hours',
    'День рождения, нужен торт',
    'активно',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 3. Максимилиан - телефон заканчивается на 3535 (третий Макс*)
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, comment, status, created_at, updated_at) VALUES
(
    9,
    'Максимилиан',
    '+79991113535',
    CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '20 hours',
    CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '22 hours',
    'VIP зона, бизнес встреча',
    'активно',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 4. Анна - телефон заканчивается на 7890
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, comment, status, created_at, updated_at) VALUES
(
    3,
    'Анна',
    '+79261237890',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '12 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '14 hours',
    'Бизнес-ланч',
    'активно',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 5. Иван - телефон заканчивается на 5555
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, comment, status, created_at, updated_at) VALUES
(
    4,
    'Иван',
    '+79851115555',
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '13 hours',
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '15 hours',
    'Семейный обед на 6 человек',
    'активно',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 6. Елена - телефон заканчивается на 1234
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, comment, status, created_at, updated_at) VALUES
(
    5,
    'Елена',
    '+79167771234',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '17 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '18 hours 30 minutes',
    'Романтический ужин',
    'активно',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 7. Дмитрий - телефон заканчивается на 9999
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, comment, status, created_at, updated_at) VALUES
(
    6,
    'Дмитрий',
    '+79039999999',
    CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '18 hours',
    CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '20 hours',
    'Встреча с клиентами',
    'активно',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 8. Ольга - телефон заканчивается на 4567
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, comment, status, created_at, updated_at) VALUES
(
    10,
    'Ольга',
    '+79214564567',
    CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '19 hours',
    CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '21 hours',
    'Терраса, большая компания',
    'активно',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 9. Сергей - телефон заканчивается на 8888 (формат с 8)
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, comment, status, created_at, updated_at) VALUES
(
    7,
    'Сергей',
    '+79998888888',
    CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '14 hours',
    CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '17 hours',
    'Корпоратив на 8 человек',
    'активно',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 10. Мария - телефон заканчивается на 0000
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, comment, status, created_at, updated_at) VALUES
(
    8,
    'Мария',
    '+79150000000',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '20 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '22 hours',
    'У выхода, нужна детская комната',
    'активно',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================
-- ТЕСТОВЫЕ СЛУЧАИ ДЛЯ ПРОВЕРКИ
-- ============================================

-- Кейс 1: Прошлое бронирование (завершенное)
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, comment, status, created_at, updated_at) VALUES
(
    1,
    'Тест Завершенный',
    '+79991112233',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '2 hours',
    'Прошедшее бронирование',
    'завершено',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
);

-- Кейс 2: Отмененное бронирование
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, comment, status, created_at, updated_at) VALUES
(
    2,
    'Тест Отмененный',
    '+79991114444',
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '2 hours',
    'Отмененная бронь',
    'отменено',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================
-- ПРОВЕРОЧНЫЕ ЗАПРОСЫ
-- ============================================

-- 1. Найти все активные бронирования на имя "Макс" с последними 4 цифрами "3535"
-- Должно вернуть 3 результата: Макс, Максим, Максимилиан
SELECT 
    booking_id,
    client_name,
    client_phone,
    RIGHT(client_phone, 4) AS last_four,
    start_time,
    status
FROM bookings
WHERE status = 'активно'
  AND LOWER(client_name) LIKE '%макс%'
  AND client_phone LIKE '%3535'
ORDER BY start_time;

-- 2. Найти бронирования только по последним 4 цифрам (без имени)
SELECT 
    booking_id,
    client_name,
    client_phone,
    RIGHT(client_phone, 4) AS last_four,
    start_time
FROM bookings
WHERE status = 'активно'
  AND client_phone LIKE '%3535'
ORDER BY start_time;

-- 3. Найти бронирования только по имени (частичное совпадение)
SELECT 
    booking_id,
    client_name,
    client_phone,
    start_time
FROM bookings
WHERE status = 'активно'
  AND LOWER(client_name) LIKE '%анн%'
ORDER BY start_time;

-- 4. Статистика по бронированиям
SELECT 
    status,
    COUNT(*) AS count
FROM bookings
GROUP BY status;

-- 5. Все активные бронирования с информацией о столах
SELECT 
    b.booking_id,
    b.client_name,
    b.client_phone,
    RIGHT(b.client_phone, 4) AS last_four,
    b.start_time,
    b.end_time,
    t.location,
    t.seats
FROM bookings b
JOIN tables t ON b.table_id = t.table_id
WHERE b.status = 'активно'
ORDER BY b.start_time;

-- ============================================
-- ТЕСТИРОВАНИЕ КОНФЛИКТОВ БРОНИРОВАНИЯ
-- ============================================

-- Проверка наличия конфликта для нового бронирования
-- (должен использоваться в приложении перед созданием)
DO $$
DECLARE
    test_table_id INT := 1;
    test_start_time TIMESTAMP := CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '18 hours';
    test_end_time TIMESTAMP := CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '20 hours';
    conflict_count INT;
BEGIN
    SELECT COUNT(*) INTO conflict_count
    FROM bookings
    WHERE table_id = test_table_id
      AND status = 'активно'
      AND (
          (test_start_time >= start_time AND test_start_time < end_time) OR
          (test_end_time > start_time AND test_end_time <= end_time) OR
          (test_start_time <= start_time AND test_end_time >= end_time)
      );
    
    RAISE NOTICE 'Конфликтов найдено: %', conflict_count;
    
    IF conflict_count > 0 THEN
        RAISE NOTICE 'КОНФЛИКТ: Стол % уже забронирован на это время', test_table_id;
    ELSE
        RAISE NOTICE 'OK: Стол % свободен на это время', test_table_id;
    END IF;
END $$;

-- ============================================
-- ПОЛЕЗНЫЕ ЗАПРОСЫ ДЛЯ ОТЛАДКИ
-- ============================================

-- Посмотреть все бронирования с форматированным временем
SELECT 
    booking_id,
    client_name,
    client_phone,
    TO_CHAR(start_time, 'DD.MM.YYYY HH24:MI') AS start_formatted,
    TO_CHAR(end_time, 'DD.MM.YYYY HH24:MI') AS end_formatted,
    status,
    comment
FROM bookings
ORDER BY start_time DESC
LIMIT 20;

-- Найти доступные столы на конкретное время
SELECT 
    t.table_id,
    t.location,
    t.seats
FROM tables t
WHERE t.is_active = TRUE
  AND t.table_id NOT IN (
    SELECT b.table_id
    FROM bookings b
    WHERE b.status = 'активно'
      AND b.start_time <= CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '19 hours'
      AND b.end_time > CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '19 hours'
  )
ORDER BY t.seats, t.location;

-- Очистить тестовые данные (если нужно)
-- DELETE FROM bookings WHERE client_name LIKE 'Тест%';

COMMIT;
