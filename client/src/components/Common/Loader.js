import React from 'react';

const Loader = ({ text = 'Загрузка...' }) => {
  return (
    <div className="loading" data-testid="loader">
      <div className="spinner"></div>
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
};

export default Loader;