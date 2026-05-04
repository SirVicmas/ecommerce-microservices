const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Read service URLs from environment variables
const PRODUCTS_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001';
const ORDERS_URL = process.env.ORDERS_SERVICE_URL || 'http://localhost:3002';

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

// Products routes — forward to products service
app.get('/api/products', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCTS_URL}/products`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const response = await axios.post(`${PRODUCTS_URL}/products`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders routes — forward to orders service
app.get('/api/orders', async (req, res) => {
  try {
    const response = await axios.get(`${ORDERS_URL}/orders`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const response = await axios.post(`${ORDERS_URL}/orders`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));