import React from 'react';

const PlaneItem = ({ plane, onEdit, onDelete }) => {
  return (
    <tr>
      <td>{plane.id}</td>
      <td>{plane.name}</td>
      <td>
        <span className="badge badge-info">{plane.category}</span>
      </td>
      <td>{plane.seats_count}</td>
      <td>
        <div className="action-buttons">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onEdit(plane)}
          >
            ✏️ Редактировать
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(plane.id)}
          >
            🗑️ Удалить
          </button>
        </div>
      </td>
    </tr>
  );
};

export default PlaneItem;