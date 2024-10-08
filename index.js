require('dotenv').config();

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const router = require('./router');
const { sequelize } = require('./models');
const errorMiddleware = require('./middlewares/error-middleware');

const HTTP_PORT = process.env.HTTP_PORT || 7570;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
  const corsWhiteList = ['https://localhost:5173'];

  if (corsWhiteList.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    res.setHeader('Access-Control-Allow-Credentials', true);
  }

  next();
});
app.use('/', router);
app.use(errorMiddleware);

const httpServer = http.createServer(app);

httpServer.listen(HTTP_PORT, async () => {
  await sequelize.authenticate();
  console.log(`HTTP Server running on port ${HTTP_PORT}`);
});
