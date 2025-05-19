import React, { useState, useEffect } from 'react';

const PLANE_CATEGORIES = ['Региональный', 'Средний', 'Дальний'];

const PlaneForm = ({ plane, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: PLANE_CATEGORIES[0],
    seats_count: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (plane) {
      setFormData({
        name: plane.name,
        category: plane.category,
        seats_count: plane.seats_count
      });
    }
  }, [plane]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Название обязательно';
    }
    
    if (!formData.seats_count || formData.seats_count <= 0) {
      newErrors.seats_count = 'Количество мест должно быть больше 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    onSubmit({
      ...formData,
      seats_count: parseInt(formData.seats_count)
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Название самолета</label>
        <input
          type="text"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          placeholder="Например: Boeing 737-800"
        />
        {errors.name && <div className="text-danger">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label>Категория</label>
        <select
          name="category"
          className="form-control"
          value={formData.category}
          onChange={handleChange}
        >
          {PLANE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Количество мест</label>
        <input
          type="number"
          name="seats_count"
          className="form-control"
          value={formData.seats_count}
          onChange={handleChange}
          placeholder="Например: 189"
        />
        {errors.seats_count && <div className="text-danger">{errors.seats_count}</div>}
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Отмена
        </button>
        <button type="submit" className="btn btn-primary">
          {plane ? 'Обновить' : 'Создать'}
        </button>
      </div>
    </form>
  );
};

export default PlaneForm;