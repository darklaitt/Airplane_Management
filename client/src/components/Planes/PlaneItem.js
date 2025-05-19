import React from 'react';

const PlaneItem = ({ plane, onEdit, onDelete }) => {
  // Безопасное получение данных с fallback значениями
  const safeId = plane?.id || 'N/A';
  const safeName = plane?.name || 'Неизвестно';
  const safeCategory = plane?.category || 'Не указана';
  const safeSeatsCount = plane?.seats_count || 0;

  // Функция для получения цвета бейджа категории
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Региональный':
        return 'badge-info';
      case 'Средний':
        return 'badge-warning';
      case 'Дальний':
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <tr>
      <td>{safeId}</td>
      <td className="plane-name-cell">{safeName}</td>
      <td>
        <span className={`badge ${getCategoryBadgeClass(safeCategory)}`}>
          {safeCategory}
        </span>
      </td>
      <td>{safeSeatsCount}</td>
      <td>
        <div className="action-buttons">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onEdit(plane)}
            title="Редактировать самолет"
          >
            ✏️ Редактировать
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(plane.id)}
            title="Удалить самолет"
          >
            🗑️ Удалить
          </button>
        </div>
      </td>
    </tr>
  );
};

export default PlaneItem;