import React, { useEffect, useState } from 'react';
import api from '../services/apiService';
import Loader from '../components/Common/Loader';
import ErrorMessage from '../components/Common/ErrorMessage';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tickets');
      setTickets(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки билетов');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите отменить этот билет?')) {
      try {
        await api.delete(`/tickets/${id}`);
        setSuccess('Билет успешно отменен');
        fetchTickets();
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка отмены билета');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('ru-RU');
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

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading) return <Loader text="Загрузка билетов..." />;

  return (
    <div className="tickets-page">
      <div className="page-header">
        <h1>Управление билетами</h1>
        <button className="btn btn-primary">
          ➕ Продать билет
        </button>
      </div>

      {error && <ErrorMessage message={error} type="danger" />}
      {success && <ErrorMessage message={success} type="success" />}

      <div className="card">
        <div className="card-body">
          {tickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎫</div>
              <p>Билеты не найдены</p>
              <p>Продайте первый билет</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Номер кассы</th>
                    <th>Номер рейса</th>
                    <th>Самолет</th>
                    <th>Маршрут</th>
                    <th>Дата вылета</th>
                    <th>Время продажи</th>
                    <th>Цена</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td>{ticket.id}</td>
                      <td>{ticket.counter_number}</td>
                      <td>{ticket.flight_number}</td>
                      <td>{ticket.plane_name}</td>
                      <td>{formatStops(ticket.stops)}</td>
                      <td>{formatDate(ticket.flight_date)}</td>
                      <td>{formatDateTime(ticket.sale_time)}</td>
                      <td>{formatPrice(ticket.price)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(ticket.id)}
                        >
                          🗑️ Отменить
                        </button>
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

export default Tickets;