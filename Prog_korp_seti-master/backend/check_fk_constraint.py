import psycopg2

conn = psycopg2.connect(
    host='localhost',
    port=5432,
    database='restaurant_db',
    user='postgres',
    password='postgres123'
)
cur = conn.cursor()

# Проверка структуры FK constraint
print("=== FK Constraint Details ===")
cur.execute("""
    SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'orders'
      AND tc.constraint_name = 'FK_orders_waiters_waiter_id';
""")
fk_info = cur.fetchall()
print(f"FK Info: {fk_info}")

# Проверка существующих orders с waiter_id
print("\n=== Existing orders with waiter_id ===")
cur.execute("SELECT order_id, waiter_id, table_id FROM orders LIMIT 5")
orders = cur.fetchall()
for order in orders:
    print(f"Order {order[0]}: waiter_id={order[1]}, table_id={order[2]}")

# Попробовать вставить тестовый заказ с waiter_id=59
print("\n=== Attempting test insert with waiter_id=59 ===")
try:
    cur.execute("""
        INSERT INTO orders (booking_id, comment, created_at, end_time, shift_date, start_time, status, table_id, total_price, updated_at, waiter_id)
        VALUES (NULL, 'Test order', NOW(), NOW() + INTERVAL '1 hour', NOW(), NOW(), 'pending', 14, 100.00, NOW(), 59)
        RETURNING order_id;
    """)
    result = cur.fetchone()
    print(f"Success! Created order_id: {result[0]}")
    conn.rollback()  # Откатить тестовую вставку
except Exception as e:
    print(f"Error: {e}")
    conn.rollback()

conn.close()
