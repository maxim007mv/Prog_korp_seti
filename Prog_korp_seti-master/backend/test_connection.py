#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для проверки подключения к базе данных PostgreSQL
"""

import psycopg2
from psycopg2 import sql

# Данные для подключения к базе данных
DB_CONFIG = {
    'host': 'localhost',
    'database': 'restaurant_db',
    'user': 'postgres',
    'password': 'postgres123',
    'port': 5432
}

def test_connection():
    """Проверяет подключение к базе данных и выводит информацию о таблицах"""
    try:
        print("🔄 Подключение к базе данных...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("✅ Успешное подключение к базе данных PostgreSQL!")
        print(f"📊 База данных: {DB_CONFIG['database']}")
        print(f"🏠 Хост: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
        print(f"👤 Пользователь: {DB_CONFIG['user']}")
        print()
        
        # Получаем версию PostgreSQL
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"🐘 Версия PostgreSQL: {version.split(',')[0]}")
        print()
        
        # Получаем список всех таблиц
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print(f"📋 Найдено таблиц: {len(tables)}")
        print("=" * 60)
        
        for i, table in enumerate(tables, 1):
            table_name = table[0]
            
            # Получаем количество записей в таблице
            cursor.execute(sql.SQL("SELECT COUNT(*) FROM {}").format(
                sql.Identifier(table_name)
            ))
            count = cursor.fetchone()[0]
            
            print(f"{i:2}. {table_name:30} | Записей: {count}")
        
        print("=" * 60)
        
        cursor.close()
        conn.close()
        print("\n✅ Проверка завершена успешно!")
        
    except psycopg2.Error as e:
        print(f"❌ Ошибка при подключении к базе данных:")
        print(f"   {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_connection()
