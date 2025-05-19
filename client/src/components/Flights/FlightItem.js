import React from 'react';

const FlightItem = ({ flight, onEdit, onDelete }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatStops = (stops) => {
    if (!stops || stops.length === 0) return '';
    return stops.join(' → ');
  };

  const getStatusBadge = (freeSeats, totalSeats) => {
    const percentage = (freeSeats / totalSeats) * 100;
    if (percentage > 50) return 'badge-success';
    if (percentage > 20) return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <tr>
      <td>{flight.flight_number}</td>
      <td>{flight.plane_name || 'N/A'}</td>
      <td>{formatStops(flight.stops)}</td>
      <td>{flight.departure_time}</td>
      <td>
        <span className={`badge ${getStatusBadge(flight.free_seats, flight.seats_count)}`}>
          {flight.free_seats} из {flight.seats_count}
        </span>
      </td>
      <td>{formatPrice(flight.price)}</td>
      <td>
        <div className="action-buttons">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onEdit(flight)}
          >
            ✏️ Редактировать
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(flight.id)}
          >
            🗑️ Удалить
          </button>
        </div>
      </td>
    </tr>
  );
};

export default FlightItem;