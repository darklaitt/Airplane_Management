-- Создание базы данных
DROP DATABASE IF EXISTS airline_management;
CREATE DATABASE airline_management;
USE airline_management;

-- Таблица самолетов
CREATE TABLE planes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    seats_count INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица рейсов
CREATE TABLE flights (
    id INT PRIMARY KEY AUTO_INCREMENT,
    flight_number VARCHAR(20) NOT NULL UNIQUE,
    plane_id INT NOT NULL,
    stops JSON DEFAULT NULL,
    departure_time TIME NOT NULL,
    free_seats INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plane_id) REFERENCES planes(id) ON DELETE RESTRICT
);

-- Таблица билетов
CREATE TABLE tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    counter_number INT NOT NULL,
    flight_number VARCHAR(20) NOT NULL,
    flight_date DATE NOT NULL,
    sale_time DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_number) REFERENCES flights(flight_number) ON DELETE RESTRICT
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_flights_plane_id ON flights(plane_id);
CREATE INDEX idx_flights_departure_time ON flights(departure_time);
CREATE INDEX idx_flights_free_seats ON flights(free_seats);
CREATE INDEX idx_tickets_flight_number ON tickets(flight_number);
CREATE INDEX idx_tickets_flight_date ON tickets(flight_date);