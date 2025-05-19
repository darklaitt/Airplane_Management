const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Database connection failed'
    });
  }

  // PostgreSQL specific error codes
  if (err.code === '23505') { // unique_violation
    return res.status(409).json({
      error: 'Duplicate Entry',
      message: 'A record with this value already exists'
    });
  }

  if (err.code === '23503') { // foreign_key_violation
    return res.status(400).json({
      error: 'Foreign Key Constraint',
      message: 'Referenced record does not exist'
    });
  }

  if (err.code === '22P02') { // invalid_text_representation
    return res.status(400).json({
      error: 'Invalid Data Type',
      message: 'Invalid data format provided'
    });
  }

  if (err.code === '42P01') { // undefined_table
    return res.status(500).json({
      error: 'Database Error',
      message: 'Database table not found'
    });
  }

  if (err.code === '42703') { // undefined_column
    return res.status(500).json({
      error: 'Database Error',
      message: 'Database column not found'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.name || 'Server Error',
    message: err.message || 'An unexpected error occurred'
  });
};

module.exports = errorHandler;