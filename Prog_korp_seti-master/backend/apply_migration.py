import os
import sys

# Добавляем путь к psycopg2
sys.path.insert(0, r'C:\Program Files\PostgreSQL\16\pgAdmin 4\venv\Lib\site-packages')

try:
    import psycopg2
    
    # Подключение к базе данных
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        database='restaurant_db',
        user='postgres',
        password='postgres'
    )
    conn.autocommit = True
    cur = conn.cursor()
    
    # Читаем SQL файл
    with open('migrations/make_waiter_id_nullable.sql', 'r', encoding='utf-8') as f:
        sql = f.read()
    
    # Выполняем команды по отдельности
    commands = [cmd.strip() for cmd in sql.split(';') if cmd.strip() and not cmd.strip().startswith('--')]
    
    for cmd in commands:
        if cmd and 'SELECT' not in cmd:
            print(f"Executing: {cmd[:50]}...")
            cur.execute(cmd)
            print("✓ Success")
        elif 'SELECT' in cmd:
            print(f"\nChecking result:")
            cur.execute(cmd)
            result = cur.fetchall()
            for row in result:
                print(f"  {row}")
    
    cur.close()
    conn.close()
    print("\n✅ Migration completed successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
