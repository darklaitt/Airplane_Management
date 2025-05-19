import React from 'react';
import FlightItem from './FlightItem';

const FlightList = ({ flights, onEdit, onDelete }) => {
  if (!flights || flights.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🛫</div>
        <p>Рейсы не найдены</p>
        <p>Добавьте первый рейс в систему</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table flights-table">
        <thead>
          <tr>
            <th>Номер рейса</th>
            <th>Самолет</th>
            <th>Маршрут</th>
            <th>Время вылета</th>
            <th>Свободные места</th>
            <th>Цена</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {flights.map(flight => (
            <FlightItem
              key={flight.id}
              flight={flight}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FlightList;