-- Добавление недостающих столов (7-16)
-- Проверяем, какие столы уже существуют, и добавляем только недостающие

-- Стол 7 (Основной зал - 4 места)
INSERT INTO tables (table_id, location, seats, is_active, created_at, updated_at)
SELECT 7, 'Основной зал - Центр', 4, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_id = 7);

-- Стол 8 (Основной зал - 4 места)
INSERT INTO tables (table_id, location, seats, is_active, created_at, updated_at)
SELECT 8, 'Основной зал - Правая сторона', 4, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_id = 8);

-- Стол 9 (Основной зал - 4 места)
INSERT INTO tables (table_id, location, seats, is_active, created_at, updated_at)
SELECT 9, 'Основной зал - Левый угол', 4, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_id = 9);

-- Стол 10 (Основной зал - 4 места)
INSERT INTO tables (table_id, location, seats, is_active, created_at, updated_at)
SELECT 10, 'Основной зал - Центр слева', 4, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_id = 10);

-- Стол 11 (Основной зал - 4 места)
INSERT INTO tables (table_id, location, seats, is_active, created_at, updated_at)
SELECT 11, 'Основной зал - Центр справа', 4, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_id = 11);

-- Стол 12 (Зона свободной посадки - 2 места, будка)
INSERT INTO tables (table_id, location, seats, is_active, created_at, updated_at)
SELECT 12, 'Свободная посадка - Будка 1', 2, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_id = 12);

-- Стол 13 (Зона свободной посадки - 2 места, будка)
INSERT INTO tables (table_id, location, seats, is_active, created_at, updated_at)
SELECT 13, 'Свободная посадка - Будка 2', 2, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_id = 13);

-- Стол 14 (Зона свободной посадки - 2 места, будка)
INSERT INTO tables (table_id, location, seats, is_active, created_at, updated_at)
SELECT 14, 'Свободная посадка - Будка 3', 2, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_id = 14);

-- Стол 15 (Зона свободной посадки - 4 места)
INSERT INTO tables (table_id, location, seats, is_active, created_at, updated_at)
SELECT 15, 'Свободная посадка - Стол 1', 4, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_id = 15);

-- Стол 16 (Зона свободной посадки - 4 места)
INSERT INTO tables (table_id, location, seats, is_active, created_at, updated_at)
SELECT 16, 'Свободная посадка - Стол 2', 4, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_id = 16);

-- Проверяем результат
SELECT table_id, location, seats, is_active 
FROM tables 
ORDER BY table_id;
