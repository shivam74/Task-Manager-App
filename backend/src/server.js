require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSockets } = require('./sockets');
const { isS3Configured, getS3Config } = require('./utils/s3');

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
initSockets(server);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  if (isS3Configured()) {
    const { region, bucket } = getS3Config();
    console.log(`File storage: AWS S3 (bucket: ${bucket}, region: ${region})`);
  } else {
    console.warn('WARNING: AWS S3 env vars missing — PDF uploads will fail until configured.');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
