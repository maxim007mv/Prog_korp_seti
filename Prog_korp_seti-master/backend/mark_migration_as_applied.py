#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для пометки миграции Entity Framework как примененной
"""

import psycopg2

# Данные для подключения к базе данных
DB_CONFIG = {
    'host': 'localhost',
    'database': 'restaurant_db',
    'user': 'postgres',
    'password': 'postgres123',
    'port': 5432
}

def mark_migration_as_applied():
    """Помечает миграцию как примененную"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Проверяем, есть ли таблица __EFMigrationsHistory
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = '__EFMigrationsHistory'
            )
        """)
        
        table_exists = cursor.fetchone()[0]
        
        if table_exists:
            # Проверяем, есть ли уже запись о миграции
            cursor.execute("""
                SELECT COUNT(*) FROM "__EFMigrationsHistory" 
                WHERE "MigrationId" = '20251028175003_InitialCreate'
            """)
            
            migration_exists = cursor.fetchone()[0]
            
            if migration_exists == 0:
                # Вставляем запись о примененной миграции
                cursor.execute("""
                    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                    VALUES ('20251028175003_InitialCreate', '8.0.11')
                """)
                conn.commit()
                print("✅ Миграция помечена как примененная")
            else:
                print("✅ Миграция уже помечена как примененная")
        else:
            print("❌ Таблица __EFMigrationsHistory не найдена")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Ошибка при работе с базой данных: {e}")

if __name__ == "__main__":
    mark_migration_as_applied()