import React, { useState, useEffect } from 'react';

const FlightForm = ({ flight, planes, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    flight_number: '',
    plane_id: '',
    stops: ['', ''],
    departure_time: '',
    free_seats: '',
    price: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (flight) {
      setFormData({
        flight_number: flight.flight_number,
        plane_id: flight.plane_id,
        stops: flight.stops || ['', ''],
        departure_time: flight.departure_time.slice(0, 5),
        free_seats: flight.free_seats,
        price: flight.price
      });
    }
  }, [flight]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleStopChange = (index, value) => {
    const newStops = [...formData.stops];
    newStops[index] = value;
    setFormData(prev => ({
      ...prev,
      stops: newStops
    }));
  };

  const addStop = () => {
    setFormData(prev => ({
      ...prev,
      stops: [...prev.stops, '']
    }));
  };

  const removeStop = (index) => {
    if (formData.stops.length > 2) {
      const newStops = formData.stops.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        stops: newStops
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.flight_number) {
      newErrors.flight_number = 'Номер рейса обязателен';
    }
    
    if (!formData.plane_id) {
      newErrors.plane_id = 'Выберите самолет';
    }
    
    if (formData.stops.some(stop => !stop)) {
      newErrors.stops = 'Все пункты маршрута должны быть заполнены';
    }
    
    if (!formData.departure_time) {
      newErrors.departure_time = 'Время вылета обязательно';
    }
    
    if (!formData.free_seats || formData.free_seats < 0) {
      newErrors.free_seats = 'Количество мест должно быть неотрицательным';
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Цена должна быть больше 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    onSubmit({
      ...formData,
      plane_id: parseInt(formData.plane_id),
      free_seats: parseInt(formData.free_seats),
      price: parseFloat(formData.price),
      departure_time: formData.departure_time + ':00'
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Номер рейса</label>
          <input
            type="text"
            name="flight_number"
            className="form-control"
            value={formData.flight_number}
            onChange={handleChange}
            placeholder="Например: SU1234"
          />
          {errors.flight_number && <div className="text-danger">{errors.flight_number}</div>}
        </div>

        <div className="form-group">
          <label>Самолет</label>
          <select
            name="plane_id"
            className="form-control"
            value={formData.plane_id}
            onChange={handleChange}
          >
            <option value="">Выберите самолет</option>
            {planes.map(plane => (
              <option key={plane.id} value={plane.id}>
                {plane.name} ({plane.seats_count} мест)
              </option>
            ))}
          </select>
          {errors.plane_id && <div className="text-danger">{errors.plane_id}</div>}
        </div>
      </div>

      <div className="form-group">
        <label>Маршрут</label>
        {formData.stops.map((stop, index) => (
          <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              className="form-control"
              value={stop}
              onChange={(e) => handleStopChange(index, e.target.value)}
              placeholder={index === 0 ? 'Пункт отправления' : index === formData.stops.length - 1 ? 'Пункт назначения' : 'Промежуточная остановка'}
            />
            {index > 1 && index < formData.stops.length - 1 && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removeStop(index)}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={addStop}
        >
          Добавить остановку
        </button>
        {errors.stops && <div className="text-danger">{errors.stops}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Время вылета</label>
          <input
            type="time"
           name="departure_time"
           className="form-control"
           value={formData.departure_time}
           onChange={handleChange}
         />
         {errors.departure_time && <div className="text-danger">{errors.departure_time}</div>}
       </div>

       <div className="form-group">
         <label>Свободные места</label>
         <input
           type="number"
           name="free_seats"
           className="form-control"
           value={formData.free_seats}
           onChange={handleChange}
         />
         {errors.free_seats && <div className="text-danger">{errors.free_seats}</div>}
       </div>

       <div className="form-group">
         <label>Цена билета</label>
         <input
           type="number"
           name="price"
           className="form-control"
           value={formData.price}
           onChange={handleChange}
           step="0.01"
         />
         {errors.price && <div className="text-danger">{errors.price}</div>}
       </div>
     </div>

     <div className="modal-footer">
       <button type="button" className="btn btn-secondary" onClick={onClose}>
         Отмена
       </button>
       <button type="submit" className="btn btn-primary">
         {flight ? 'Обновить' : 'Создать'}
       </button>
     </div>
   </form>
 );
};

export default FlightForm;