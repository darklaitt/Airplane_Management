import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FlightList from '../components/Flights/FlightList';
import FlightForm from '../components/Flights/FlightForm';
import FlightSearch from '../components/Flights/FlightSearch';
import Modal from '../components/Common/Modal';
import Loader from '../components/Common/Loader';
import ErrorMessage from '../components/Common/ErrorMessage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Flights = () => {
  const [flights, setFlights] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    fetchFlights();
    fetchPlanes();
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/flights`);
      setFlights(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки рейсов');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanes = async () => {
    try {
      const response = await axios.get(`${API_URL}/planes`);
      setPlanes(response.data.data);
    } catch (err) {
      console.error('Error fetching planes:', err);
    }
  };

  const handleSubmit = async (flightData) => {
    try {
      if (editingFlight) {
        await axios.put(`${API_URL}/flights/${editingFlight._id}`, flightData);
        setSuccess('Рейс успешно обновлен');
      } else {
        await axios.post(`${API_URL}/flights`, flightData);
        setSuccess('Рейс успешно добавлен');
      }
      fetchFlights();
      handleCloseForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения рейса');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот рейс?')) {
      try {
        await axios.delete(`${API_URL}/flights/${id}`);
        setSuccess('Рейс успешно удален');
        fetchFlights();
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка удаления рейса');
      }
    }
  };

  const handleSearch = async (type, params) => {
    try {
      setLoading(true);
      let response;
      
      switch (type) {
        case 'nearest':
          response = await axios.get(`${API_URL}/flights/search/nearest`, { params });
          setSearchResults(response.data.data);
          break;
        case 'non-stop':
          response = await axios.get(`${API_URL}/flights/search/non-stop`);
          setFlights(response.data.data);
          break;
        case 'most-expensive':
          response = await axios.get(`${API_URL}/flights/search/most-expensive`);
          setSearchResults(response.data.data);
          break;
        case 'replacement':
          response = await axios.get(`${API_URL}/flights/search/replacement-candidates`);
          setFlights(response.data.data);
          break;
        case 'check-seats':
          response = await axios.get(`${API_URL}/flights/check-seats/${params.flightId}`);
          setSearchResults(response.data.data);
          break;
        default:
          break;
      }
      
      setShowSearch(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка поиска');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (flight) => {
    setEditingFlight(flight);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingFlight(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingFlight(null);
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

  if (loading && !searchResults) return <Loader />;

  return (
    <div className="flights-page">
      <div className="page-header">
        <h1>Управление рейсами</h1>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => setShowSearch(true)}>
            🔍 Поиск рейсов
          </button>
          <button className="btn btn-primary" onClick={handleAdd}>
            ➕ Добавить рейс
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} type="danger" />}
      {success && <ErrorMessage message={success} type="success" />}

      {searchResults && (
        <div className="search-results">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Результаты поиска</h3>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => {
                  setSearchResults(null);
                  fetchFlights();
                }}
              >
                Закрыть
              </button>
            </div>
            <div className="card-body">
              {searchResults.flight_number ? (
                <div>
                  <p><strong>Номер рейса:</strong> {searchResults.flight_number}</p>
                  <p><strong>Свободные места:</strong> {searchResults.free_seats}</p>
                  <p><strong>Статус:</strong> {searchResults.has_free_seats ? 'Есть свободные места' : 'Мест нет'}</p>
                </div>
              ) : (
                <FlightList
                  flights={[searchResults]}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {!searchResults && (
        <FlightList
          flights={flights}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingFlight ? 'Редактировать рейс' : 'Добавить рейс'}
      >
        <FlightForm
          flight={editingFlight}
          planes={planes}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      </Modal>

      <Modal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        title="Поиск рейсов"
      >
        <FlightSearch
          onSearch={handleSearch}
          onClose={() => setShowSearch(false)}
        />
      </Modal>
    </div>
  );
};

export default Flights;