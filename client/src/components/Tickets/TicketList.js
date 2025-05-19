import React from 'react';
import TicketItem from './TicketItem';

const TicketList = ({ tickets, onDelete }) => {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎫</div>
        <p>Билеты не найдены</p>
        <p>Продайте первый билет</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Номер кассы</th>
            <th>Номер рейса</th>
            <th>Самолет</th>
            <th>Маршрут</th>
            <th>Дата вылета</th>
            <th>Время продажи</th>
            <th>Цена</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <TicketItem
              key={ticket.id}
              ticket={ticket}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketList;