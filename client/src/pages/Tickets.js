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
     const response = await axios.get(`${API_URL}/tickets`);
     setTickets(response.data.data);
     setError(null);
   } catch (err) {
     setError(err.response?.data?.message || 'Ошибка загрузки билетов');
   } finally {
     setLoading(false);
   }
 };

 const fetchFlights = async () => {
   try {
     const response = await axios.get(`${API_URL}/flights`);
     setFlights(response.data.data);
   } catch (err) {
     console.error('Error fetching flights:', err);
   }
 };

 const handleSubmit = async (ticketData) => {
   try {
     await axios.post(`${API_URL}/tickets`, ticketData);
     setSuccess('Билет успешно продан');
     fetchTickets();
     fetchFlights(); // Обновляем рейсы для актуализации свободных мест
     handleCloseForm();
   } catch (err) {
     setError(err.response?.data?.message || 'Ошибка продажи билета');
   }
 };

 const handleDelete = async (id) => {
   if (window.confirm('Вы уверены, что хотите отменить этот билет?')) {
     try {
       await axios.delete(`${API_URL}/tickets/`);
       setSuccess('Билет успешно отменен');
       fetchTickets();
       fetchFlights(); // Обновляем рейсы для актуализации свободных мест
     } catch (err) {
       setError(err.response?.data?.message || 'Ошибка отмены билета');
     }
   }
 };

 const handleSellTicket = () => {
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
   </div>
 );
};

export default Tickets;