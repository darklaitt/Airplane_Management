import React, { useEffect, useState } from 'react';
import api from '../services/apiService';
import Loader from '../components/Common/Loader';
import ErrorMessage from '../components/Common/ErrorMessage';

const Flights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await api.get('/flights');
      setFlights(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки рейсов');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот рейс?')) {
      try {
        await api.delete(`/flights/${id}`);
        setSuccess('Рейс успешно удален');
        fetchFlights();
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка удаления рейса');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatStops = (stops) => {
    if (!stops || stops.length === 0) return '';
    return stops.join(' → ');
  };

  const getStatusBadge = (freeSeats, totalSeats) => {
    const percentage = (freeSeats / totalSeats) * 100;
    if (percentage > 50) return 'badge-success';
    if (percentage > 20) return 'badge-warning';
    return 'badge-danger';
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading) return <Loader text="Загрузка рейсов..." />;

  return (
    <div className="flights-page">
      <div className="page-header">
        <h1>Управление рейсами</h1>
        <div className="actions">
          <button className="btn btn-secondary">
            🔍 Поиск рейсов
          </button>
          <button className="btn btn-primary">
            ➕ Добавить рейс
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} type="danger" />}
      {success && <ErrorMessage message={success} type="success" />}

      <div className="card">
        <div className="card-body">
          {flights.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛫</div>
              <p>Рейсы не найдены</p>
              <p>Добавьте первый рейс в систему</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Номер рейса</th>
                    <th>Самолет</th>
                    <th>Маршрут</th>
                    <th>Время вылета</th>
                    <th>Свободные места</th>
                    <th>Цена</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map(flight => (
                    <tr key={flight.id}>
                      <td>{flight.flight_number}</td>
                      <td>{flight.plane_name || 'N/A'}</td>
                      <td>{formatStops(flight.stops)}</td>
                      <td>{flight.departure_time}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(flight.free_seats, flight.seats_count)}`}>
                          {flight.free_seats} из {flight.seats_count}
                        </span>
                      </td>
                      <td>{formatPrice(flight.price)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-secondary btn-sm">
                            ✏️ Редактировать
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(flight.id)}
                          >
                            🗑️ Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flights;