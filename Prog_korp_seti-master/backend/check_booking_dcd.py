import psycopg2

conn = psycopg2.connect(
    host='localhost',
    port=5432,
    database='restaurant_db',
    user='postgres',
    password='postgres123'
)
cur = conn.cursor()

# Проверка бронирования для клиента "dcd"
print("=== Searching for booking with name 'dcd' ===")
cur.execute("""
    SELECT booking_id, client_name, client_phone, start_time, end_time, status, table_id
    FROM bookings
    WHERE LOWER(client_name) LIKE '%dcd%'
    LIMIT 5
""")
bookings = cur.fetchall()
for booking in bookings:
    print(f"Booking ID: {booking[0]}")
    print(f"  Client: {booking[1]}")
    print(f"  Phone: {booking[2]}")
    print(f"  Start: {booking[3]}")
    print(f"  End: {booking[4]}")
    print(f"  Status: '{booking[5]}'")  # Обратите внимание на кавычки - они покажут точное значение
    print(f"  Table ID: {booking[6]}")
    print()

# Проверка телефона с последними 4 цифрами 9999
print("=== Searching for phone ending with 9999 ===")
cur.execute("""
    SELECT booking_id, client_name, client_phone, status
    FROM bookings
    WHERE client_phone LIKE '%9999'
    LIMIT 5
""")
phone_bookings = cur.fetchall()
for booking in phone_bookings:
    print(f"Booking ID: {booking[0]}, Client: {booking[1]}, Phone: {booking[2]}, Status: '{booking[3]}'")

# Проверка всех уникальных статусов в таблице
print("\n=== All unique statuses in bookings table ===")
cur.execute("SELECT DISTINCT status FROM bookings")
statuses = cur.fetchall()
for status in statuses:
    print(f"Status: '{status[0]}' (length: {len(status[0])}, bytes: {status[0].encode('utf-8')})")

conn.close()
