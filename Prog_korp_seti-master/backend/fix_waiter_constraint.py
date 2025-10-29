import psycopg2

# Подключение к базе данных
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="restaurant_db",
    user="postgres",
    password="postgres"
)

cur = conn.cursor()

try:
    # Удаляем старый constraint
    print("Удаление старого constraint...")
    cur.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS FK_orders_waiters_waiter_id;")
    
    # Делаем колонку nullable
    print("Изменение колонки waiter_id на nullable...")
    cur.execute("ALTER TABLE orders ALTER COLUMN waiter_id DROP NOT NULL;")
    
    # Создаем новый constraint с ON DELETE SET NULL
    print("Создание нового constraint...")
    cur.execute("""
        ALTER TABLE orders 
        ADD CONSTRAINT FK_orders_waiters_waiter_id 
        FOREIGN KEY (waiter_id) 
        REFERENCES users(user_id) 
        ON DELETE SET NULL;
    """)
    
    conn.commit()
    print("✅ База данных успешно обновлена!")
    print("✅ Колонка waiter_id теперь nullable")
    
except Exception as e:
    conn.rollback()
    print(f"❌ Ошибка: {e}")
    
finally:
    cur.close()
    conn.close()
