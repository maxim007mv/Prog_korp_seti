import psycopg2

conn = psycopg2.connect(
    host='localhost',
    port=5432,
    database='restaurant_db',
    user='postgres',
    password='postgres123'
)
cur = conn.cursor()

# Проверка user_id=59
print("=== Checking user_id=59 ===")
cur.execute("SELECT user_id, role FROM users WHERE user_id = 59")
result = cur.fetchall()
print(f"User 59: {result}")

# Поиск всех официантов
print("\n=== All waiters ===")
cur.execute("SELECT user_id, role FROM users WHERE role = 'waiter' LIMIT 10")
waiters = cur.fetchall()
print(f"Waiters: {waiters}")

# Поиск всех пользователей с похожими ролями
print("\n=== All users and their roles ===")
cur.execute("SELECT user_id, role FROM users LIMIT 20")
users = cur.fetchall()
for user in users:
    print(f"User {user[0]}: {user[1]}")

conn.close()
