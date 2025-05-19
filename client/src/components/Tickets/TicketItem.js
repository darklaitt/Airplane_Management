import React from 'react';

const TicketItem = ({ ticket, onDelete }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('ru-RU');
  };

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

  return (
    <tr>
      <td>{ticket.id}</td>
      <td>{ticket.counter_number}</td>
      <td>{ticket.flight_number}</td>
      <td>{ticket.plane_name}</td>
      <td>{formatStops(ticket.stops)}</td>
      <td>{formatDate(ticket.flight_date)}</td>
      <td>{formatDateTime(ticket.sale_time)}</td>
      <td>{formatPrice(ticket.price)}</td>
      <td>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(ticket.id)}
        >
          🗑️ Отменить
        </button>
      </td>
    </tr>
  );
};

export default TicketItem;