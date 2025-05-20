import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TicketList from '../components/Tickets/TicketList';
import TicketForm from '../components/Tickets/TicketForm';
import Modal from '../components/Common/Modal';
import Loader from '../components/Common/Loader';
import ErrorMessage from '../components/Common/ErrorMessage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchFlights();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching tickets from:', `${API_URL}/tickets`);
      
      const response = await axios.get(`${API_URL}/tickets`);
      console.log('Tickets response:', response.data);
      
      if (response.data && response.data.success) {
        setTickets(response.data.data || []);
      } else {
        setTickets(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.response?.data?.message || 'Ошибка загрузки билетов');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlights = async () => {
    try {
      const response = await axios.get(`${API_URL}/flights`);
      console.log('Flights for tickets:', response.data);
      
      if (response.data && response.data.success) {
        setFlights(response.data.data || []);
      } else {
        setFlights(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching flights:', err);
      setFlights([]);
    }
  };

  const handleSubmit = async (ticketData) => {
    try {
      setError(null);
      console.log('Submitting ticket data:', ticketData);
      
      const url = `${API_URL}/tickets`;
      console.log('POST URL:', url);
      
      const response = await axios.post(url, ticketData);
      console.log('Create response:', response.data);
      
      setSuccess('Билет успешно продан');
      await fetchTickets();
      await fetchFlights(); // Обновляем рейсы для актуализации свободных мест
      handleCloseForm();
      
    } catch (err) {
      console.error('Error submitting ticket:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Ошибка продажи билета');
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      setError('ID билета не указан');
      return;
    }
    
    if (window.confirm('Вы уверены, что хотите отменить этот билет?')) {
      try {
        setError(null);
        console.log('Deleting ticket with ID:', id);
        const url = `${API_URL}/tickets/${id}`;
        console.log('DELETE URL:', url);
        
        const response = await axios.delete(url);
        console.log('Delete response:', response.data);
        
        setSuccess('Билет успешно отменен');
        await fetchTickets();
        await fetchFlights(); // Обновляем рейсы для актуализации свободных мест
        
      } catch (err) {
        console.error('Error deleting ticket:', err);
        console.error('Error response:', err.response?.data);
        setError(err.response?.data?.message || 'Ошибка отмены билета');
      }
    }
  };

  const handleSellTicket = () => {
    console.log('Selling new ticket');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
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

  if (loading) return <Loader />;

  return (
    <div className="tickets-page">
      <div className="page-header">
        <h1>Управление билетами</h1>
        <button className="btn btn-primary" onClick={handleSellTicket}>
          ➕ Продать билет
        </button>
      </div>

      {error && <ErrorMessage message={error} type="danger" />}
      {success && <ErrorMessage message={success} type="success" />}

      <TicketList
        tickets={tickets}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title="Продажа билета"
      >
        <TicketForm
          flights={flights}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      </Modal>
      
      {/* Отладочная информация */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          bottom: '60px', 
          left: '10px', 
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '5px',
          fontSize: '12px',
          maxWidth: '300px'
        }}>
          <div><strong>Debug Info:</strong></div>
          <div>API URL: {API_URL}</div>
          <div>Tickets count: {tickets.length}</div>
          <div>Flights count: {flights.length}</div> 
          <div>Form open: {showForm.toString()}</div>
        </div>
      )}
    </div>
  );
};

export default Tickets;