-- Создание тестовых данных для ресторана
-- 10 миллионов рублей выручки, разнообразные бронирования, заказы

BEGIN;

-- ========================================
-- 1. ОЧИСТКА СТАРЫХ ТЕСТОВЫХ ДАННЫХ
-- ========================================
-- Удаляем только тестовые данные, созданные этим скриптом
DELETE FROM order_items WHERE order_id IN (
    SELECT order_id FROM orders WHERE waiter_id IN (SELECT user_id FROM users WHERE email LIKE 'test%@restaurant.com')
);
DELETE FROM orders WHERE waiter_id IN (
    SELECT user_id FROM users WHERE email LIKE 'test%@restaurant.com'
);
DELETE FROM bookings WHERE client_name LIKE 'Тест%' OR client_phone LIKE '+7999%';
DELETE FROM users WHERE email LIKE 'test%@restaurant.com';

-- ========================================
-- 2. СОЗДАНИЕ ОФИЦИАНТОВ (5 человек)
-- ========================================
-- Создаем 5 тестовых официантов (только если их еще нет)
INSERT INTO users (email, password_hash, username, role, is_active, created_at, updated_at)
SELECT email, password_hash, username, role, is_active, created_at, updated_at FROM (
    VALUES
        ('test.waiter1@restaurant.com', '$2a$11$hash1', 'test_waiter1', 'waiter', true, NOW(), NOW()),
        ('test.waiter2@restaurant.com', '$2a$11$hash2', 'test_waiter2', 'waiter', true, NOW(), NOW()),
        ('test.waiter3@restaurant.com', '$2a$11$hash3', 'test_waiter3', 'waiter', true, NOW(), NOW()),
        ('test.waiter4@restaurant.com', '$2a$11$hash4', 'test_waiter4', 'waiter', true, NOW(), NOW()),
        ('test.waiter5@restaurant.com', '$2a$11$hash5', 'test_waiter5', 'waiter', true, NOW(), NOW())
) AS new_users(email, password_hash, username, role, is_active, created_at, updated_at)
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE users.username = new_users.username
);

-- Создаем записи в waiters для тестовых пользователей
INSERT INTO waiters (user_id, first_name, last_name, phone, hire_date, is_active)
SELECT u.user_id, 'Официант', split_part(u.username, '_', 2), '+79260820000', NOW() - '1 year'::interval, true
FROM users u
WHERE u.username LIKE 'test_waiter%'
AND NOT EXISTS (SELECT 1 FROM waiters w WHERE w.user_id = u.user_id);

-- ========================================
-- 3. СОЗДАНИЕ АКТИВНЫХ БРОНИРОВАНИЙ
-- ======================================== 
-- 20 активных бронирований на ближайшие дни
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, status, comment, created_at, updated_at)
SELECT 
    (random() * 15 + 1)::int as table_id,
    (ARRAY['Максим Ломакин', 'Анна Иванова', 'Сергей Петров', 'Ольга Сидорова', 'Дмитрий Козлов', 
           'Екатерина Морозова', 'Андрей Новиков', 'Мария Волкова', 'Павел Соколов', 'Наталья Федорова'])[floor(random() * 10 + 1)::int] as client_name,
    '+7926082' || lpad((random() * 9999)::int::text, 4, '0') as client_phone,
    NOW() + (random() * 7 || ' days')::interval + (random() * 12 || ' hours')::interval as start_time,
    NOW() + (random() * 7 || ' days')::interval + (random() * 12 + 2 || ' hours')::interval as end_time,
    'активно' as status,
    CASE WHEN random() > 0.7 THEN 'Окно' WHEN random() > 0.4 THEN 'Детское кресло' ELSE NULL END as comment,
    NOW() - (random() * 2 || ' days')::interval as created_at,
    NOW() - (random() * 2 || ' days')::interval as updated_at
FROM generate_series(1, 20);

-- ========================================
-- 4. СОЗДАНИЕ ЗАВЕРШЕННЫХ БРОНИРОВАНИЙ
-- ========================================
-- 100 завершенных бронирований за последние 90 дней
INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, status, comment, created_at, updated_at)
SELECT 
    (random() * 15 + 1)::int as table_id,
    (ARRAY['Иван Иванов', 'Петр Петров', 'Сидор Сидоров', 'Федор Федоров', 'Николай Николаев',
           'Александр Александров', 'Владимир Владимиров', 'Татьяна Татьянова', 'Людмила Людмилова', 'Светлана Светланова'])[floor(random() * 10 + 1)::int] as client_name,
    '+7' || (900 + (random() * 99)::int) || lpad((random() * 9999999)::int::text, 7, '0') as client_phone,
    NOW() - (random() * 90 || ' days')::interval + (random() * 12 || ' hours')::interval as start_time,
    NOW() - (random() * 90 || ' days')::interval + (random() * 12 + 2 || ' hours')::interval as end_time,
    'завершено' as status,
    NULL as comment,
    NOW() - (random() * 90 || ' days')::interval - '1 day'::interval as created_at,
    NOW() - (random() * 90 || ' days')::interval as updated_at
FROM generate_series(1, 100);

-- ========================================
-- 5. СОЗДАНИЕ ЗАКАЗОВ С ВЫРУЧКОЙ 10М РУБ
-- ========================================
-- 500 закрытых заказов за последние 90 дней
DO $$
DECLARE
    waiter_ids int[];
    dish_ids int[];
    new_order_id int;
    total_revenue numeric := 0;
    target_revenue numeric := 10000000; -- 10 миллионов
    order_count int := 500;
    avg_order_price numeric := target_revenue / order_count; -- ~20,000 руб за заказ
BEGIN
    -- Получаем ID официантов
    SELECT ARRAY_AGG(waiter_id) INTO waiter_ids FROM waiters w 
    JOIN users u ON w.user_id = u.user_id 
    WHERE u.email LIKE 'test%@restaurant.com';
    
    -- Получаем ID блюд
    SELECT ARRAY_AGG(dish_id) INTO dish_ids FROM dishes WHERE is_available = true LIMIT 20;
    
    -- Создаём заказы
    FOR i IN 1..order_count LOOP
        -- Создаём заказ
        INSERT INTO orders (table_id, waiter_id, status, total_price, start_time, end_time, updated_at)
        VALUES (
            (random() * 15 + 1)::int,
            waiter_ids[floor(random() * array_length(waiter_ids, 1) + 1)::int],
            'closed',
            (avg_order_price * (0.5 + random()))::numeric(10,2), -- Вариация ±50%
            NOW() - (random() * 90 || ' days')::interval,
            NOW() - (random() * 90 || ' days')::interval + '45 minutes'::interval,
            NOW() - (random() * 90 || ' days')::interval + '30 minutes'::interval
        )
        RETURNING order_id INTO new_order_id;
        
        -- Добавляем 3-7 блюд в заказ
        FOR j IN 1..(3 + (random() * 4)::int) LOOP
            INSERT INTO order_items (order_id, dish_id, quantity, price)
            SELECT 
                new_order_id,
                dish_ids[floor(random() * array_length(dish_ids, 1) + 1)::int],
                (random() * 3 + 1)::int as quantity,
                ((500 + random() * 2000) * (random() * 3 + 1))::numeric(10,2) as price;
        END LOOP;
        
        -- Обновляем total_price заказа на основе order_items
        UPDATE orders 
        SET total_price = (
            SELECT COALESCE(SUM(price), 0) 
            FROM order_items 
            WHERE order_items.order_id = new_order_id
        )
        WHERE orders.order_id = new_order_id;
    END LOOP;
    
    -- Выводим итоговую статистику
    SELECT SUM(total_price) INTO total_revenue FROM orders WHERE waiter_id = ANY(waiter_ids);
    RAISE NOTICE 'Создано заказов: %, Общая выручка: % руб.', order_count, total_revenue;
END $$;

-- ========================================
-- 6. ДОБАВЛЕНИЕ АКТИВНЫХ ЗАКАЗОВ
-- ========================================
-- 15 активных заказов
DO $$
DECLARE
    waiter_ids int[];
    dish_ids int[];
    new_order_id int;
BEGIN
    SELECT ARRAY_AGG(waiter_id) INTO waiter_ids FROM waiters w 
    JOIN users u ON w.user_id = u.user_id 
    WHERE u.email LIKE 'test%@restaurant.com';
    SELECT ARRAY_AGG(dish_id) INTO dish_ids FROM dishes WHERE is_available = true LIMIT 20;
    
    FOR i IN 1..15 LOOP
        INSERT INTO orders (table_id, waiter_id, status, total_price, start_time, updated_at)
        VALUES (
            (random() * 15 + 1)::int,
            waiter_ids[floor(random() * array_length(waiter_ids, 1) + 1)::int],
            CASE 
                WHEN random() > 0.7 THEN 'pending'
                WHEN random() > 0.4 THEN 'in_progress'
                ELSE 'ready'
            END,
            0,
            NOW() - (random() * 2 || ' hours')::interval,
            NOW() - (random() * 30 || ' minutes')::interval
        )
        RETURNING order_id INTO new_order_id;
        
        -- Добавляем блюда
        FOR j IN 1..(2 + (random() * 4)::int) LOOP
            INSERT INTO order_items (order_id, dish_id, quantity, price)
            SELECT 
                new_order_id,
                dish_ids[floor(random() * array_length(dish_ids, 1) + 1)::int],
                (random() * 2 + 1)::int,
                ((500 + random() * 2000) * (random() * 2 + 1))::numeric(10,2);
        END LOOP;
        
        UPDATE orders 
        SET total_price = (SELECT COALESCE(SUM(price), 0) FROM order_items WHERE order_items.order_id = new_order_id)
        WHERE orders.order_id = new_order_id;
    END LOOP;
END $$;

COMMIT;

-- ========================================
-- ПРОВЕРКА РЕЗУЛЬТАТОВ
-- ========================================
SELECT 
    '=== СТАТИСТИКА ТЕСТОВЫХ ДАННЫХ ===' as info;

SELECT 
    'Официанты' as type,
    COUNT(*) as count
FROM users 
WHERE email LIKE 'test%@restaurant.com'
UNION ALL
SELECT 
    'Активные бронирования',
    COUNT(*)
FROM bookings 
WHERE status = 'активно'
UNION ALL
SELECT 
    'Завершенные бронирования',
    COUNT(*)
FROM bookings 
WHERE status = 'завершено'
UNION ALL
SELECT 
    'Активные заказы',
    COUNT(*)
FROM orders 
WHERE status IN ('новый', 'в процессе', 'готов')
UNION ALL
SELECT 
    'Закрытые заказы',
    COUNT(*)
FROM orders 
WHERE status = 'закрыт'
UNION ALL
SELECT 
    'Общая выручка (руб.)',
    ROUND(SUM(total_price), 2)
FROM orders 
WHERE status = 'закрыт';
