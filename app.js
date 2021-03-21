const express = require('express');
const morgan = require('morgan');

const nftRouter = require('./routes/nftRoutes');
const contractRouter = require('./routes/contractRoutes');

const app = express();

//? 1) MIDDLEWARE
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//? 2) ROUTES
app.use('/api/v1/nft', nftRouter);
app.use('/api/v1/contract', contractRouter);

module.exports = app;
