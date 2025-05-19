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
    if (!stops) return '';
    
    // Если stops - строка JSON, парсим её
    if (typeof stops === 'string') {
      try {
        const parsed = JSON.parse(stops);
        return Array.isArray(parsed) ? parsed.join(' → ') : stops;
      } catch (e) {
        return stops;
      }
    }
    
    // Если stops - массив
    if (Array.isArray(stops)) {
      return stops.join(' → ');
    }
    
    return stops.toString();
  };

  const getStatusBadge = (freeSeats, totalSeats) => {
    const percentage = (freeSeats / totalSeats) * 100;
    if (percentage > 50) return 'badge-success';
    if (percentage > 20) return 'badge-warning';
    return 'badge-danger';
  };

  // Безопасная обработка данных
  const safeFlightNumber = flight?.flight_number || 'N/A';
  const safePlaneName = flight?.plane_name || 'Неизвестно';
  const safeStops = formatStops(flight?.stops);
  const safeDepartureTime = flight?.departure_time || 'N/A';
  const safeFreeSeats = flight?.free_seats || 0;
  const safeSeatsCount = flight?.seats_count || safeFreeSeats;
  const safePrice = flight?.price || 0;

  return (
    <tr>
      <td>{safeFlightNumber}</td>
      <td>{safePlaneName}</td>
      <td className="route-cell">{safeStops}</td>
      <td>{safeDepartureTime}</td>
      <td>
        <span className={`badge ${getStatusBadge(safeFreeSeats, safeSeatsCount)}`}>
          {safeFreeSeats} из {safeSeatsCount}
        </span>
      </td>
      <td>{formatPrice(safePrice)}</td>
      <td>
        <div className="action-buttons">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onEdit(flight)}
            title="Редактировать рейс"
          >
            ✏️ Редактировать
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(flight.id)}
            title="Удалить рейс"
          >
            🗑️ Удалить
          </button>
        </div>
      </td>
    </tr>
  );
};

export default FlightItem;