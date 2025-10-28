-- Генерация свежих тестовых данных с выручкой 10М руб за последние 7 дней
-- Распределение: сегодня, вчера, последние 7 дней

DO $$
DECLARE
    v_waiter_ids INT[];
    v_table_ids INT[];
    v_dish_ids INT[];
    v_current_day DATE := CURRENT_DATE;
    v_order_count INT := 0;
    v_total_revenue DECIMAL := 0;
    v_order_id INT;
    v_day_offset INT;
    v_orders_per_day INT;
    v_target_revenue DECIMAL := 10000000.00; -- 10М руб
    v_avg_order_price DECIMAL;
    v_dish_id INT;
    v_dish_price DECIMAL;
    v_quantity INT;
    v_order_total DECIMAL;
    v_order_time TIMESTAMP;
BEGIN
    -- Получаем реальные ID официантов, столиков и блюд
    SELECT ARRAY_AGG(waiter_id) INTO v_waiter_ids FROM waiters LIMIT 10;
    SELECT ARRAY_AGG(table_id) INTO v_table_ids FROM tables WHERE is_active = true LIMIT 20;
    SELECT ARRAY_AGG(dish_id) INTO v_dish_ids FROM dishes WHERE is_available = true LIMIT 100;
    
    RAISE NOTICE 'Начинаем генерацию свежих данных с целевой выручкой 10М руб...';
    
    -- Средняя цена заказа для достижения 10М за 7 дней
    v_avg_order_price := v_target_revenue / 800; -- ~800 заказов за неделю = 12500 руб/заказ
    
    -- Генерируем заказы за последние 7 дней (от сегодня до -6 дней)
    FOR v_day_offset IN 0..6 LOOP
        -- Больше заказов на выходные и сегодня
        IF v_day_offset = 0 THEN -- Сегодня
            v_orders_per_day := 150;
        ELSIF v_day_offset = 1 THEN -- Вчера
            v_orders_per_day := 130;
        ELSIF v_day_offset IN (5, 6) THEN -- Выходные
            v_orders_per_day := 140;
        ELSE
            v_orders_per_day := 100;
        END IF;
        
        FOR i IN 1..v_orders_per_day LOOP
            -- Генерируем время заказа (10:00 - 23:00)
            v_order_time := (v_current_day - v_day_offset) + 
                           (INTERVAL '10 hours') + 
                           (INTERVAL '1 hour' * (random() * 13));
            
            -- Создаем заказ
            INSERT INTO orders (
                table_id, 
                waiter_id, 
                status, 
                total_price, 
                created_at, 
                updated_at
            ) VALUES (
                v_table_ids[1 + floor(random() * array_length(v_table_ids, 1))::INT],
                v_waiter_ids[1 + floor(random() * array_length(v_waiter_ids, 1))::INT],
                CASE 
                    WHEN v_day_offset = 0 AND random() > 0.7 THEN 'in_progress' -- Сегодня 30% в процессе
                    WHEN v_day_offset = 0 AND random() > 0.5 THEN 'pending' -- Сегодня 20% ожидают
                    ELSE 'closed' -- Остальные закрыты
                END,
                0, -- Временно, обновим после добавления позиций
                v_order_time,
                v_order_time
            ) RETURNING order_id INTO v_order_id;
            
            v_order_total := 0;
            
            -- Добавляем 2-5 позиций в заказ
            FOR j IN 1..(2 + floor(random() * 4))::INT LOOP
                v_dish_id := v_dish_ids[1 + floor(random() * array_length(v_dish_ids, 1))::INT];
                
                SELECT price INTO v_dish_price FROM dishes WHERE dish_id = v_dish_id;
                v_quantity := 1 + floor(random() * 3)::INT;
                
                INSERT INTO order_items (
                    order_id,
                    dish_id,
                    quantity,
                    price
                ) VALUES (
                    v_order_id,
                    v_dish_id,
                    v_quantity,
                    v_dish_price
                );
                
                v_order_total := v_order_total + (v_dish_price * v_quantity);
            END LOOP;
            
            -- Обновляем total_price заказа
            UPDATE orders SET total_price = v_order_total WHERE order_id = v_order_id;
            
            v_order_count := v_order_count + 1;
            v_total_revenue := v_total_revenue + v_order_total;
        END LOOP;
        
        RAISE NOTICE 'День % (сегодня - %): создано % заказов', v_day_offset, v_day_offset, v_orders_per_day;
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Генерация завершена!';
    RAISE NOTICE 'Создано заказов: %', v_order_count;
    RAISE NOTICE 'Общая выручка: % руб.', ROUND(v_total_revenue, 2);
    RAISE NOTICE '========================================';
END $$;

-- Статистика по дням
SELECT 
    DATE(created_at) as date,
    COUNT(*) as orders_count,
    ROUND(SUM(total_price), 2) as daily_revenue,
    ROUND(AVG(total_price), 2) as avg_check
FROM orders 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
