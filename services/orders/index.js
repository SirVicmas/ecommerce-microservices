const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'ordersdb',
  port: 5432,
});

// RabbitMQ connection
let channel;

async function connectRabbitMQ() {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    const connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertQueue('order_placed');
    console.log('Connected to RabbitMQ');
  } catch (err) {
    // RabbitMQ not ready yet — retry after 5 seconds
    console.log('RabbitMQ not ready, retrying in 5 seconds...');
    setTimeout(connectRabbitMQ, 5000);
  }
}

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
    const productUrl = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001';
    await axios.get(`${productUrl}/products`);

    const result = await pool.query(
      'INSERT INTO orders (product_id, quantity, status) VALUES ($1, $2, $3) RETURNING *',
      [product_id, quantity, 'pending']
    );

    const order = result.rows[0];

    // Publish message to RabbitMQ
    if (channel) {
      channel.sendToQueue(
        'order_placed',
        Buffer.from(JSON.stringify({
          order_id: order.id,
          product_id: order.product_id,
          quantity: order.quantity
        }))
      );
      console.log(`Message published: order ${order.id} placed`);
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Orders service running on port ${PORT}`);
  connectRabbitMQ();
});