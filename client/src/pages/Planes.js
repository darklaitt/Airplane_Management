
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PlaneList from '../components/Planes/PlaneList';
import PlaneForm from '../components/Planes/PlaneForm';
import Modal from '../components/Common/Modal';
import Loader from '../components/Common/Loader';
import ErrorMessage from '../components/Common/ErrorMessage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Planes = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlane, setEditingPlane] = useState(null);

  useEffect(() => {
    fetchPlanes();
  }, []);

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching planes from:', `${API_URL}/planes`);
      
      const response = await axios.get(`${API_URL}/planes`);
      console.log('Planes response:', response.data);
      
      if (response.data && response.data.success) {
        setPlanes(response.data.data || []);
      } else {
        setPlanes(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching planes:', err);
      setError(err.response?.data?.message || 'Ошибка загрузки самолетов');
      setPlanes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (planeData) => {
    try {
      setError(null);
      console.log('Submitting plane data:', planeData);
      
      if (editingPlane) {
        // Обновление существующего самолета
        console.log('Updating plane with ID:', editingPlane.id);
        const url = `${API_URL}/planes/${editingPlane.id}`;
        console.log('PUT URL:', url);
        
        const response = await axios.put(url, planeData);
        console.log('Update response:', response.data);
        
        setSuccess('Самолет успешно обновлен');
      } else {
        // Создание нового самолета
        console.log('Creating new plane');
        const url = `${API_URL}/planes`;
        console.log('POST URL:', url);
        
        const response = await axios.post(url, planeData);
        console.log('Create response:', response.data);
        
        setSuccess('Самолет успешно добавлен');
      }
      
      // Перезагружаем список самолетов
      await fetchPlanes();
      handleCloseForm();
      
    } catch (err) {
      console.error('Error submitting plane:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Ошибка сохранения самолета');
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      setError('ID самолета не указан');
      return;
    }
    
    if (window.confirm('Вы уверены, что хотите удалить этот самолет?')) {
      try {
        setError(null);
        console.log('Deleting plane with ID:', id);
        const url = `${API_URL}/planes/${id}`;
        console.log('DELETE URL:', url);
        
        const response = await axios.delete(url);
        console.log('Delete response:', response.data);
        
        setSuccess('Самолет успешно удален');
        await fetchPlanes();
        
      } catch (err) {
        console.error('Error deleting plane:', err);
        console.error('Error response:', err.response?.data);
        setError(err.response?.data?.message || 'Ошибка удаления самолета');
      }
    }
  };

  const handleEdit = (plane) => {
    console.log('Editing plane:', plane);
    if (!plane || !plane.id) {
      setError('Неверные данные самолета');
      return;
    }
    setEditingPlane(plane);
    setShowForm(true);
  };

  const handleAdd = () => {
    console.log('Adding new plane');
    setEditingPlane(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPlane(null);
  };

  // Автоматически скрываем сообщения через 5 секунд
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
    <div className="planes-page">
      <div className="page-header">
        <h1>Управление самолетами</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ Добавить самолет
        </button>
      </div>

      {error && <ErrorMessage message={error} type="danger" />}
      {success && <ErrorMessage message={success} type="success" />}

      <div className="planes-content">
        <PlaneList
          planes={planes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingPlane ? 'Редактировать самолет' : 'Добавить самолет'}
      >
        <PlaneForm
          plane={editingPlane}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      </Modal>
      
      {/* Отладочная информация (только в development) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '5px',
          fontSize: '12px',
          maxWidth: '300px'
        }}>
          <div><strong>Debug Info:</strong></div>
          <div>API URL: {API_URL}</div>
          <div>Planes count: {planes.length}</div>
          <div>Loading: {loading.toString()}</div>
          <div>Editing: {editingPlane ? editingPlane.id : 'none'}</div>
        </div>
      )}
    </div>
  );
};

export default Planes;