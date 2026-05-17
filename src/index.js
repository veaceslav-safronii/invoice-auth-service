require('dotenv').config();

const net = require('net');
global.sendLog = (service, message) => {
  try {
    const client = new net.Socket();
    client.connect(5044, 'logstash', () => {
      client.write(JSON.stringify({ service, message, timestamp: new Date().toISOString() }) + '\n');
      client.destroy();
    });
    client.on('error', () => {});
  } catch (e) {}
};

const express = require('express');
const { initDb } = require('./db');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Root health check
app.get('/', (req, res) => {
  res.json({ service: 'invoice-auth-service', version: '1.0.0', status: 'running' });
});

// Start server after DB is ready
const start = async () => {
  let retries = 10;
  while (retries > 0) {
    try {
      await initDb();
      break;
    } catch (err) {
      console.log(`DB not ready, retrying... (${retries} left)`);
      retries--;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });
};

start();
