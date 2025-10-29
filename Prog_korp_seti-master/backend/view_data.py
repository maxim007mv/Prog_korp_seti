#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для просмотра примеров данных из базы данных
"""

import psycopg2
from psycopg2.extras import RealDictCursor

# Данные для подключения к базе данных
DB_CONFIG = {
    'host': 'localhost',
    'database': 'restaurant_db',
    'user': 'postgres',
    'password': 'postgres123',
    'port': 5432
}

def show_sample_data():
    """Показывает примеры данных из ключевых таблиц"""
    try:
        conn = psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
        cursor = conn.cursor()
        
        print("=" * 80)
        print("📊 ПРОСМОТР ДАННЫХ БАЗЫ restaurant_db")
        print("=" * 80)
        print()
        
        # Пользователи
        print("👥 ПОЛЬЗОВАТЕЛИ (первые 5):")
        print("-" * 80)
        cursor.execute("""
            SELECT user_id, username, email, role, is_active, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 5
        """)
        users = cursor.fetchall()
        for user in users:
            print(f"ID: {user['user_id']:3} | {user['username']:20} | {user['email']:30} | {user['role']:15} | Активен: {user['is_active']}")
        print()
        
        # Официанты
        print("🍽️  ОФИЦИАНТЫ (первые 5):")
        print("-" * 80)
        cursor.execute("""
            SELECT w.waiter_id, w.first_name, w.last_name, w.phone, w.is_active, u.username
            FROM waiters w
            LEFT JOIN users u ON w.user_id = u.user_id
            WHERE w.is_active = true
            ORDER BY w.waiter_id
            LIMIT 5
        """)
        waiters = cursor.fetchall()
        for waiter in waiters:
            username = waiter['username'] or 'N/A'
            print(f"ID: {waiter['waiter_id']:3} | {waiter['first_name']} {waiter['last_name']:20} | {waiter['phone']:15} | User: {username}")
        print()
        
        # Столы
        print("🪑 СТОЛЫ (первые 10):")
        print("-" * 80)
        cursor.execute("""
            SELECT table_id, location, seats, is_active 
            FROM tables 
            WHERE is_active = true
            ORDER BY table_id
            LIMIT 10
        """)
        tables = cursor.fetchall()
        for table in tables:
            print(f"Стол #{table['table_id']:3} | Расположение: {table['location']:30} | Мест: {table['seats']:2}")
        print()
        
        # Категории блюд
        print("📋 КАТЕГОРИИ БЛЮД:")
        print("-" * 80)
        cursor.execute("""
            SELECT c.category_id, c.category_name, COUNT(d.dish_id) as dish_count
            FROM dish_categories c
            LEFT JOIN dishes d ON c.category_id = d.category_id AND d.is_deleted = false
            GROUP BY c.category_id, c.category_name
            ORDER BY c.display_order, c.category_name
        """)
        categories = cursor.fetchall()
        for cat in categories:
            print(f"ID: {cat['category_id']:2} | {cat['category_name']:30} | Блюд: {cat['dish_count']:4}")
        print()
        
        # Блюда
        print("🍕 БЛЮДА (первые 10 доступных):")
        print("-" * 80)
        cursor.execute("""
            SELECT d.dish_id, d.dish_name, d.price, c.category_name, d.is_available
            FROM dishes d
            LEFT JOIN dish_categories c ON d.category_id = c.category_id
            WHERE d.is_deleted = false AND d.is_available = true
            ORDER BY d.dish_id
            LIMIT 10
        """)
        dishes = cursor.fetchall()
        for dish in dishes:
            cat_name = dish['category_name'] or 'Без категории'
            print(f"ID: {dish['dish_id']:4} | {dish['dish_name']:40} | {dish['price']:7} ₽ | {cat_name}")
        print()
        
        # Бронирования (последние)
        print("📅 БРОНИРОВАНИЯ (последние 5):")
        print("-" * 80)
        cursor.execute("""
            SELECT b.booking_id, b.client_name, b.client_phone, 
                   t.location, b.start_time, b.status
            FROM bookings b
            LEFT JOIN tables t ON b.table_id = t.table_id
            ORDER BY b.start_time DESC
            LIMIT 5
        """)
        bookings = cursor.fetchall()
        for booking in bookings:
            location = booking['location'] or 'N/A'
            print(f"ID: {booking['booking_id']:4} | {booking['client_name']:20} | {booking['client_phone']:15} | Стол: {location:20} | {booking['start_time']} | {booking['status']}")
        print()
        
        # Заказы (последние)
        print("🛒 ЗАКАЗЫ (последние 5):")
        print("-" * 80)
        cursor.execute("""
            SELECT o.order_id, t.location, w.first_name || ' ' || w.last_name as waiter_name,
                   o.total_price, o.status, o.start_time
            FROM orders o
            LEFT JOIN tables t ON o.table_id = t.table_id
            LEFT JOIN waiters w ON o.waiter_id = w.waiter_id
            ORDER BY o.start_time DESC
            LIMIT 5
        """)
        orders = cursor.fetchall()
        for order in orders:
            waiter = order['waiter_name'] or 'N/A'
            location = order['location'] or 'N/A'
            print(f"ID: {order['order_id']:4} | Стол: {location:20} | Официант: {waiter:20} | Сумма: {order['total_price']:8} ₽ | {order['status']}")
        print()
        
        # Статистика
        print("📊 ОБЩАЯ СТАТИСТИКА:")
        print("-" * 80)
        
        # Общее количество заказов и сумма
        cursor.execute("""
            SELECT COUNT(*) as total_orders, 
                   COALESCE(SUM(total_price), 0) as total_revenue
            FROM orders
            WHERE status IN ('завершён', 'оплачен')
        """)
        stats = cursor.fetchone()
        print(f"Завершенных заказов: {stats['total_orders']}")
        print(f"Общая выручка: {stats['total_revenue']:,.2f} ₽")
        print()
        
        # Самые популярные блюда
        cursor.execute("""
            SELECT d.dish_name, COUNT(*) as order_count, 
                   SUM(oi.quantity) as total_quantity
            FROM order_items oi
            JOIN dishes d ON oi.dish_id = d.dish_id
            GROUP BY d.dish_id, d.dish_name
            ORDER BY order_count DESC
            LIMIT 5
        """)
        popular = cursor.fetchall()
        print("🏆 ТОП-5 ПОПУЛЯРНЫХ БЛЮД:")
        for i, dish in enumerate(popular, 1):
            print(f"  {i}. {dish['dish_name']:40} - заказано {dish['order_count']} раз(а), всего порций: {dish['total_quantity']}")
        
        print()
        print("=" * 80)
        print("✅ Просмотр данных завершён!")
        print("=" * 80)
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Ошибка при работе с базой данных:")
        print(f"   {e}")

if __name__ == "__main__":
    show_sample_data()
