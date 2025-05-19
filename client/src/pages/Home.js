import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Common/Loader';
import ErrorMessage from '../components/Common/ErrorMessage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/reports/general`);
        setStats(response.data.data.summary);
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка загрузки статистики');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="home-page">
      <h1>Система управления авиаперевозками</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalFlights || 0}</div>
          <div className="stat-label">Всего рейсов</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats?.totalDirectFlights || 0}</div>
          <div className="stat-label">Прямых рейсов</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats?.totalFreeSeats || 0}</div>
          <div className="stat-label">Свободных мест</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats?.overallLoadPercentage || 0}%</div>
          <div className="stat-label">Загруженность</div>
        </div>
      </div>

      <div className="quick-links">
        <h2>Быстрые действия</h2>
        <div className="links-grid">
          <Link to="/planes" className="quick-link">
            <span style={{ fontSize: '2rem' }}>✈️</span>
            <span>Управление самолетами</span>
          </Link>
          <Link to="/flights" className="quick-link">
            <span style={{ fontSize: '2rem' }}>🛫</span>
            <span>Управление рейсами</span>
          </Link>
          <Link to="/tickets" className="quick-link">
            <span style={{ fontSize: '2rem' }}>🎫</span>
            <span>Продажа билетов</span>
          </Link>
          <Link to="/reports" className="quick-link">
            <span style={{ fontSize: '2rem' }}>📊</span>
            <span>Отчеты</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;