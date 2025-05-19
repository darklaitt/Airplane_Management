import React from 'react';

const ErrorMessage = ({ message, type = 'danger' }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      {message}
    </div>
  );
};

export default ErrorMessage;