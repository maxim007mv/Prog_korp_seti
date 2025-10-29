import psycopg2

conn = psycopg2.connect(
    host='localhost',
    port=5432,
    database='restaurant_db',
    user='postgres',
    password='postgres123'
)
cur = conn.cursor()

# Посмотреть все записи в таблице waiters
print("=== All waiters in 'waiters' table ===")
cur.execute("SELECT * FROM waiters LIMIT 10")
waiters = cur.fetchall()
for waiter in waiters:
    print(f"Waiter: {waiter}")

# Структура таблицы waiters
print("\n=== Waiters table structure ===")
cur.execute("""
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'waiters'
    ORDER BY ordinal_position;
""")
columns = cur.fetchall()
for col in columns:
    print(f"Column: {col[0]}, Type: {col[1]}, Nullable: {col[2]}")

# Связь между users и waiters (если есть user_id в waiters)
print("\n=== Checking if waiters has user_id column ===")
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'waiters' AND column_name = 'user_id'")
has_user_id = cur.fetchone()
print(f"Has user_id column: {has_user_id is not None}")

conn.close()
