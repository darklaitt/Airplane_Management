DROP DATABASE IF EXISTS airline_management;
CREATE DATABASE airline_management 
    WITH ENCODING 'UTF8' 
    LC_COLLATE 'ru_RU.UTF-8' 
    LC_CTYPE 'ru_RU.UTF-8'
    TEMPLATE template0;

-- Подключение к базе данных
\c airline_management;

-- Установка кодировки клиента
SET client_encoding = 'UTF8';

-- Таблица самолетов
CREATE TABLE planes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    seats_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица рейсов
CREATE TABLE flights (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL UNIQUE,
    plane_id INTEGER NOT NULL,
    stops JSONB DEFAULT '[]',
    departure_time TIME NOT NULL,
    free_seats INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plane_id) REFERENCES planes(id) ON DELETE RESTRICT
);

-- Таблица билетов
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    counter_number INTEGER NOT NULL,
    flight_number VARCHAR(20) NOT NULL,
    flight_date DATE NOT NULL,
    sale_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_number) REFERENCES flights(flight_number) ON DELETE RESTRICT
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_flights_plane_id ON flights(plane_id);
CREATE INDEX idx_flights_departure_time ON flights(departure_time);
CREATE INDEX idx_flights_free_seats ON flights(free_seats);
CREATE INDEX idx_tickets_flight_number ON tickets(flight_number);
CREATE INDEX idx_tickets_flight_date ON tickets(flight_date);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_planes_updated_at
    BEFORE UPDATE ON planes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flights_updated_at
    BEFORE UPDATE ON flights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();