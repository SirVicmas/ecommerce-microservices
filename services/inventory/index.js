const express = require('express');
const { Pool } = require('pg');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'productsdb',
  port: 5432,
});

async function connectRabbitMQ() {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue('order_placed');

    console.log('Inventory service waiting for messages...');

    // Listen for messages on the order_placed queue
    channel.consume('order_placed', async (message) => {
      if (message !== null) {
        const order = JSON.parse(message.content.toString());
        console.log(`Received order: ${JSON.stringify(order)}`);

        try {
          // Reduce stock for the ordered product
          await pool.query(
            'UPDATE products SET stock = stock - $1 WHERE id = $2',
            [order.quantity, order.product_id]
          );
          console.log(`Stock reduced for product ${order.product_id} by ${order.quantity}`);

          // Acknowledge the message — tell RabbitMQ we processed it
          channel.ack(message);
        } catch (err) {
          console.error('Failed to update stock:', err.message);
          // Reject the message — put it back in the queue
          channel.nack(message);
        }
      }
    });
  } catch (err) {
    console.log('RabbitMQ not ready, retrying in 5 seconds...');
    setTimeout(connectRabbitMQ, 5000);
  }
}

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'inventory' }));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Inventory service running on port ${PORT}`);
  connectRabbitMQ();
});