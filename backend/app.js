const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');

const jobDetailRoutes = require('./routes/jobDetailsRoutes');
const timesheetRoutes = require('./routes/timesheetRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const clientRoutes = require('./routes/clientRoutes');
const contractorRoutes = require('./routes/contractorsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { checkJwt } = require('./middleware/authMiddleware');
const { errorHandler, notFound } = require('./middleware/errorMiddleware.js');

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

app.get('/api/healthcheck', async (req, res) => {
  res.json({ message: 'API running...' });
});

app.use('/api/users', userRoutes);
app.use('/api/timesheet', checkJwt, timesheetRoutes);
app.use('/api/job', checkJwt, jobDetailRoutes);
app.use('/api/clients', checkJwt, clientRoutes);
app.use('/api/contractors', checkJwt, contractorRoutes);
app.use('/api/contact', contactRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
