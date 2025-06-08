import React, { useEffect, useState } from 'react';
import api from '../services/apiService';
import Loader from '../components/Common/Loader';
import ErrorMessage from '../components/Common/ErrorMessage';

const Planes = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchPlanes();
  }, []);

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/planes');
      setPlanes(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки самолетов');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот самолет?')) {
      try {
        await api.delete(`/planes/${id}`);
        setSuccess('Самолет успешно удален');
        fetchPlanes();
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка удаления самолета');
      }
    }
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

  if (loading) return <Loader text="Загрузка самолетов..." />;

  return (
    <div className="planes-page">
      <div className="page-header">
        <h1>Управление самолетами</h1>
        <button className="btn btn-primary">
          ➕ Добавить самолет
        </button>
      </div>

      {error && <ErrorMessage message={error} type="danger" />}
      {success && <ErrorMessage message={success} type="success" />}

      <div className="card">
        <div className="card-body">
          {planes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✈️</div>
              <p>Самолеты не найдены</p>
              <p>Добавьте первый самолет в систему</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Категория</th>
                    <th>Кол-во мест</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {planes.map(plane => (
                    <tr key={plane.id}>
                      <td>{plane.id}</td>
                      <td>{plane.name}</td>
                      <td>
                        <span className="badge badge-info">{plane.category}</span>
                      </td>
                      <td>{plane.seats_count}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-secondary btn-sm">
                            ✏️ Редактировать
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(plane.id)}
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

export default Planes;