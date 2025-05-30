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
    data: []
  });
};

router.get('/', mockResponse);
router.get('/:id', mockResponse);
router.post('/', mockResponse);
router.put('/:id', mockResponse);
router.delete('/:id', mockResponse);

module.exports = router;
