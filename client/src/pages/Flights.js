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
      setError(null);
      console.log('Fetching flights from:', `${API_URL}/flights`);
      
      const response = await axios.get(`${API_URL}/flights`);
      console.log('Flights response:', response.data);
      
      if (response.data && response.data.success) {
        setFlights(response.data.data || []);
      } else {
        setFlights(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching flights:', err);
      setError(err.response?.data?.message || 'Ошибка загрузки рейсов');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanes = async () => {
    try {
      const response = await axios.get(`${API_URL}/planes`);
      console.log('Planes for flights:', response.data);
      
      if (response.data && response.data.success) {
        setPlanes(response.data.data || []);
      } else {
        setPlanes(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching planes:', err);
      setPlanes([]);
    }
  };

  const handleSubmit = async (flightData) => {
    try {
      setError(null);
      console.log('Submitting flight data:', flightData);
      
      if (editingFlight) {
        // Обновление существующего рейса
        console.log('Updating flight with ID:', editingFlight.id);
        const url = `${API_URL}/flights/${editingFlight.id}`;
        console.log('PUT URL:', url);
        
        const response = await axios.put(url, flightData);
        console.log('Update response:', response.data);
        
        setSuccess('Рейс успешно обновлен');
      } else {
        // Создание нового рейса
        console.log('Creating new flight');
        const url = `${API_URL}/flights`;
        console.log('POST URL:', url);
        
        const response = await axios.post(url, flightData);
        console.log('Create response:', response.data);
        
        setSuccess('Рейс успешно добавлен');
      }
      
      await fetchFlights();
      handleCloseForm();
      
    } catch (err) {
      console.error('Error submitting flight:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Ошибка сохранения рейса');
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      setError('ID рейса не указан');
      return;
    }
    
    if (window.confirm('Вы уверены, что хотите удалить этот рейс?')) {
      try {
        setError(null);
        console.log('Deleting flight with ID:', id);
        const url = `${API_URL}/flights/${id}`;
        console.log('DELETE URL:', url);
        
        const response = await axios.delete(url);
        console.log('Delete response:', response.data);
        
        setSuccess('Рейс успешно удален');
        await fetchFlights();
        
      } catch (err) {
        console.error('Error deleting flight:', err);
        console.error('Error response:', err.response?.data);
        setError(err.response?.data?.message || 'Ошибка удаления рейса');
      }
    }
  };

  const handleSearch = async (type, params) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      console.log('Searching flights:', type, params);
      
      switch (type) {
        case 'nearest':
          response = await axios.get(`${API_URL}/flights/search/nearest`, { params });
          setSearchResults(response.data.success ? response.data.data : response.data);
          break;
        case 'non-stop':
          response = await axios.get(`${API_URL}/flights/search/non-stop`);
          setFlights(response.data.success ? response.data.data : response.data);
          break;
        case 'most-expensive':
          response = await axios.get(`${API_URL}/flights/search/most-expensive`);
          setSearchResults(response.data.success ? response.data.data : response.data);
          break;
        case 'replacement':
          response = await axios.get(`${API_URL}/flights/search/replacement-candidates`);
          setFlights(response.data.success ? response.data.data : response.data);
          break;
        case 'check-seats':
          response = await axios.get(`${API_URL}/flights/check-seats/${params.flightNumber}`);
          setSearchResults(response.data.success ? response.data.data : response.data);
          break;
        default:
          break;
      }
      
      setShowSearch(false);
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Ошибка поиска');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (flight) => {
    console.log('Editing flight:', flight);
    if (!flight || !flight.id) {
      setError('Неверные данные рейса');
      return;
    }
    setEditingFlight(flight);
    setShowForm(true);
  };

  const handleAdd = () => {
    console.log('Adding new flight');
    setEditingFlight(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingFlight(null);
  };

  const clearSearchResults = () => {
    setSearchResults(null);
    fetchFlights();
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
                onClick={clearSearchResults}
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
      
      {/* Отладочная информация */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          left: '10px', 
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '5px',
          fontSize: '12px',
          maxWidth: '300px'
        }}>
          <div><strong>Debug Info:</strong></div>
          <div>API URL: {API_URL}</div>
          <div>Flights count: {flights.length}</div>
          <div>Planes count: {planes.length}</div>
          <div>Editing: {editingFlight ? editingFlight.id : 'none'}</div>
          <div>Search results: {searchResults ? 'yes' : 'no'}</div>
        </div>
      )}
    </div>
  );
};

export default Flights;