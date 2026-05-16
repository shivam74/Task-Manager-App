const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Route files
const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const tasks = require('./routes/taskRoutes');
const files = require('./routes/fileRoutes');
const analytics = require('./routes/analyticsRoutes');

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security middleware
app.use(helmet());
app.use(cors());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/tasks', tasks);
app.use('/api/files', files);
app.use('/api/analytics', analytics);

// Swagger Documentation
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error Handler
app.use(errorHandler);

module.exports = app;
