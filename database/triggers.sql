\c airline_management;

-- Триггер для автоматического уменьшения свободных мест при продаже билета
CREATE OR REPLACE FUNCTION decrease_free_seats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE flights 
  SET free_seats = free_seats - 1 
  WHERE flight_number = NEW.flight_number;
  
  -- Проверяем, что количество свободных мест не стало отрицательным
  IF (SELECT free_seats FROM flights WHERE flight_number = NEW.flight_number) < 0 THEN
    RAISE EXCEPTION 'Не хватает свободных мест на рейсе %', NEW.flight_number;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_decrease_seats
  AFTER INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION decrease_free_seats();

-- Триггер для автоматического увеличения свободных мест при отмене билета
CREATE OR REPLACE FUNCTION increase_free_seats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE flights 
  SET free_seats = free_seats + 1 
  WHERE flight_number = OLD.flight_number;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_increase_seats
  AFTER DELETE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION increase_free_seats();

-- Триггер для валидации количества свободных мест при создании/обновлении рейса
CREATE OR REPLACE FUNCTION validate_free_seats()
RETURNS TRIGGER AS $$
DECLARE
  plane_capacity INTEGER;
BEGIN
  -- Получаем вместимость самолета
  SELECT seats_count INTO plane_capacity
  FROM planes
  WHERE id = NEW.plane_id;
  
  -- Проверяем, что количество свободных мест не превышает вместимость самолета
  IF NEW.free_seats > plane_capacity THEN
    RAISE EXCEPTION 'Количество свободных мест (%) не может превышать вместимость самолета (%)', 
      NEW.free_seats, plane_capacity;
  END IF;
  
  -- Проверяем, что количество свободных мест не отрицательное
  IF NEW.free_seats < 0 THEN
    RAISE EXCEPTION 'Количество свободных мест не может быть отрицательным';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER flight_validate_seats
  BEFORE INSERT OR UPDATE ON flights
  FOR EACH ROW
  EXECUTE FUNCTION validate_free_seats();

-- Триггер для автоматического логирования изменений в критических таблицах
CREATE TABLE IF NOT EXISTS data_audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  operation VARCHAR(10) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_name VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO data_audit_log (table_name, operation, new_data, user_name)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), current_user);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO data_audit_log (table_name, operation, old_data, new_data, user_name)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), current_user);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO data_audit_log (table_name, operation, old_data, user_name)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), current_user);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры аудита для критических таблиц
CREATE TRIGGER planes_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON planes
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER flights_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON flights
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER tickets_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Триггер для автоматической очистки истекших сессий
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '1 day';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_sessions_trigger
  AFTER INSERT ON user_sessions
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_expired_sessions();

-- Триггер для валидации email формата
CREATE OR REPLACE FUNCTION validate_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Неверный формат email: %', NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_validate_email
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_email();

-- Триггер для обновления статистики рейсов
CREATE TABLE IF NOT EXISTS flight_statistics (
  flight_number VARCHAR(20) PRIMARY KEY,
  total_tickets_sold INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_flight_statistics()
RETURNS TRIGGER AS $$
DECLARE
  flight_price DECIMAL(10, 2);
BEGIN
  -- Получаем цену билета для рейса
  SELECT price INTO flight_price
  FROM flights
  WHERE flight_number = COALESCE(NEW.flight_number, OLD.flight_number);
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO flight_statistics (flight_number, total_tickets_sold, total_revenue)
    VALUES (NEW.flight_number, 1, flight_price)
    ON CONFLICT (flight_number)
    DO UPDATE SET
      total_tickets_sold = flight_statistics.total_tickets_sold + 1,
      total_revenue = flight_statistics.total_revenue + flight_price,
      last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE flight_statistics
    SET 
      total_tickets_sold = GREATEST(0, total_tickets_sold - 1),
      total_revenue = GREATEST(0, total_revenue - flight_price),
      last_updated = CURRENT_TIMESTAMP
    WHERE flight_number = OLD.flight_number;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER flight_stats_trigger
  AFTER INSERT OR DELETE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_flight_statistics();

-- Создание индексов для оптимизации производительности
CREATE INDEX IF NOT EXISTS idx_flights_stops_gin ON flights USING GIN (stops);
CREATE INDEX IF NOT EXISTS idx_tickets_sale_time ON tickets(sale_time);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_data_audit_log_timestamp ON data_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Создание представлений для упрощения запросов
CREATE OR REPLACE VIEW flight_overview AS
SELECT 
  f.id,
  f.flight_number,
  p.name as plane_name,
  p.category as plane_category,
  f.stops,
  f.departure_time,
  f.free_seats,
  p.seats_count,
  f.price,
  ROUND((p.seats_count - f.free_seats)::numeric / p.seats_count * 100, 2) as load_percentage,
  fs.total_tickets_sold,
  fs.total_revenue
FROM flights f
JOIN planes p ON f.plane_id = p.id
LEFT JOIN flight_statistics fs ON f.flight_number = fs.flight_number;

-- Представление для отчета по продажам
CREATE OR REPLACE VIEW sales_report AS
SELECT 
  DATE(t.sale_time) as sale_date,
  t.flight_number,
  f.departu_time,
  p.name as plane_name,
  COUNT(t.id) as tickets_sold,
  SUM(f.price) as total_revenue,
  AVG(f.price) as average_price
FROM tickets t
JOIN flights f ON t.flight_number = f.flight_number
JOIN planes p ON f.plane_id = p.id
GROUP BY DATE(t.sale_time), t.flight_number, f.departure_time, p.name;

-- Функция для очистки старых записей аудита
CREATE OR REPLACE FUNCTION cleanup_old_audit_records(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_log 
  WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '1 day' * days_to_keep;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  DELETE FROM data_audit_log 
  WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '1 day' * days_to_keep;
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;