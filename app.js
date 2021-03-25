const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const nftRouter = require('./routes/nftRoutes');
const contractRouter = require('./routes/contractRoutes');

const app = express();

//? 1) MIDDLEWARE
if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/get', express.static('data'));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//? 2) ROUTES
app.use('/api/v1/nft', nftRouter);
app.use('/api/v1/contract', contractRouter);

module.exports = app;
