const express = require('express');
const router = express.Router();

const mockResponse = (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Токен не предоставлен'
    });
  }
  
  res.json({
    success: true,
    data: {
      summary: {
        totalFlights: 0,
        totalDirectFlights: 0,
        averagePrice: '0.00'
      }
    }
  });
};

router.get('/general', mockResponse);
router.get('/flight-load', mockResponse);
router.get('/sales', mockResponse);

module.exports = router;