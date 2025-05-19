import React from 'react';
import PlaneItem from './PlaneItem';

const PlaneList = ({ planes, onEdit, onDelete }) => {
  if (!planes || planes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">✈️</div>
        <p>Самолеты не найдены</p>
        <p>Добавьте первый самолет в систему</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Категория</th>
            <th>Кол-во мест</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {planes.map(plane => (
            <PlaneItem
              key={plane.id}
              plane={plane}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlaneList;