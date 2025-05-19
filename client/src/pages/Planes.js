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
      const response = await axios.get(`${API_URL}/planes`);
      setPlanes(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки самолетов');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (planeData) => {
    try {
      if (editingPlane) {
        await axios.put(`${API_URL}/planes/`, planeData);
        setSuccess('Самолет успешно обновлен');
      } else {
        await axios.post(`${API_URL}/planes`, planeData);
        setSuccess('Самолет успешно добавлен');
      }
      fetchPlanes();
      handleCloseForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения самолета');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот самолет?')) {
      try {
        await axios.delete(`${API_URL}/planes/`);
        setSuccess('Самолет успешно удален');
        fetchPlanes();
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка удаления самолета');
      }
    }
  };

  const handleEdit = (plane) => {
    setEditingPlane(plane);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingPlane(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPlane(null);
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
    <div className="planes-page">
      <div className="page-header">
        <h1>Управление самолетами</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ Добавить самолет
        </button>
      </div>

      {error && <ErrorMessage message={error} type="danger" />}
      {success && <ErrorMessage message={success} type="success" />}

      <PlaneList
        planes={planes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
    </div>
  );
};

export default Planes;