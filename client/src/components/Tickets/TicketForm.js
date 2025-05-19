import React, { useState, useEffect } from 'react';

const TicketForm = ({ flights, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    counter_number: '',
    flight_number: '',
    flight_date: '',
    sale_time: new Date().toISOString().slice(0, 16)
  });

  const [selectedFlight, setSelectedFlight] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formData.flight_number) {
      const flight = flights.find(f => f.flight_number === formData.flight_number);
      setSelectedFlight(flight);
    } else {
      setSelectedFlight(null);
    }
  }, [formData.flight_number, flights]);

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

  const validate = () => {
    const newErrors = {};
    
    if (!formData.counter_number || formData.counter_number <= 0) {
      newErrors.counter_number = 'Номер кассы должен быть больше 0';
    }
    
    if (!formData.flight_number) {
      newErrors.flight_number = 'Выберите рейс';
    }
    
    if (!formData.flight_date) {
      newErrors.flight_date = 'Укажите дату вылета';
    }
    
    if (!formData.sale_time) {
      newErrors.sale_time = 'Укажите время продажи';
    }

    if (selectedFlight && selectedFlight.free_seats <= 0) {
      newErrors.flight_number = 'На этом рейсе нет свободных мест';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    onSubmit({
      ...formData,
      counter_number: parseInt(formData.counter_number),
      sale_time: formData.sale_time + ':00'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Номер кассы</label>
          <input
            type="number"
            name="counter_number"
            className="form-control"
            value={formData.counter_number}
            onChange={handleChange}
            placeholder="Например: 1"
          />
          {errors.counter_number && <div className="text-danger">{errors.counter_number}</div>}
        </div>

        <div className="form-group">
          <label>Рейс</label>
          <select
            name="flight_number"
            className="form-control"
            value={formData.flight_number}
            onChange={handleChange}
          >
            <option value="">Выберите рейс</option>
            {flights.map(flight => (
              <option 
                key={flight.id} 
                value={flight.flight_number}
                disabled={flight.free_seats <= 0}
              >
                {flight.flight_number} - {flight.stops[0]} → {flight.stops[flight.stops.length - 1]} 
                ({flight.free_seats} свободных мест)
              </option>
            ))}
          </select>
          {errors.flight_number && <div className="text-danger">{errors.flight_number}</div>}
        </div>
      </div>

      {selectedFlight && (
        <div className="ticket-info">
          <div className="ticket-info-item">
            <div className="ticket-info-label">Самолет:</div>
            <div className="ticket-info-value">{selectedFlight.plane_name}</div>
          </div>
          <div className="ticket-info-item">
            <div className="ticket-info-label">Время вылета:</div>
            <div className="ticket-info-value">{selectedFlight.departure_time}</div>
          </div>
          <div className="ticket-info-item">
            <div className="ticket-info-label">Цена билета:</div>
            <div className="ticket-info-value">{formatPrice(selectedFlight.price)}</div>
          </div>
          <div className="ticket-info-item">
            <div className="ticket-info-label">Свободных мест:</div>
            <div className="ticket-info-value">{selectedFlight.free_seats}</div>
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Дата вылета</label>
          <input
            type="date"
            name="flight_date"
            className="form-control"
            value={formData.flight_date}
            onChange={handleChange}
          />
          {errors.flight_date && <div className="text-danger">{errors.flight_date}</div>}
        </div>

        <div className="form-group">
          <label>Время продажи</label>
          <input
            type="datetime-local"
            name="sale_time"
            className="form-control"
            value={formData.sale_time}
            onChange={handleChange}
          />
          {errors.sale_time && <div className="text-danger">{errors.sale_time}</div>}
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Отмена
        </button>
        <button type="submit" className="btn btn-primary">
          Продать билет
        </button>
      </div>
    </form>
  );
};

export default TicketForm;