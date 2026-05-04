const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'ordersdb',
  port: 5432,
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'orders' }));

app.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/orders', async (req, res) => {
  const { product_id, quantity } = req.body;
  try {
    // Ask the products service if this product exists
    // Notice: it uses an environment variable for the URL — not hardcoded
    const productUrl = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001';
    await axios.get(`${productUrl}/products`);

    const result = await pool.query(
      'INSERT INTO orders (product_id, quantity, status) VALUES ($1, $2, $3) RETURNING *',
      [product_id, quantity, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Orders service running on port ${PORT}`));