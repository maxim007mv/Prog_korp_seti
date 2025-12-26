-- Делаем waiter_id nullable в таблице orders
-- Это позволит создавать заказы без назначенного официанта

-- Удаляем старый constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS FK_orders_waiters_waiter_id;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_waiters_waiter_id;

-- Делаем колонку nullable
ALTER TABLE orders ALTER COLUMN waiter_id DROP NOT NULL;

-- Создаем новый constraint с ON DELETE SET NULL
ALTER TABLE orders 
ADD CONSTRAINT FK_orders_waiters_waiter_id 
FOREIGN KEY (waiter_id) 
REFERENCES users(user_id) 
ON DELETE SET NULL;

-- Проверка
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'waiter_id';
