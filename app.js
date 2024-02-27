const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

require('dotenv').config();

const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*', cors());

// Middlewares
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(errorHandler);

const api = process.env.API_URL;
const PORT = process.env.PORT || 3000; // Set default port to 3000 if not provided in .env

const categoriesRoute = require('./routes/categories');
const productRoute = require('./routes/products');
const userRoute = require('./routes/users');
const orderRoute = require('./routes/orders');

// Routes
app.use(`${api}/products`, productRoute);
app.use(`${api}/categories`, categoriesRoute);
app.use(`${api}/users`, userRoute);
app.use(`${api}/orders`, orderRoute);

const dbConfig = require('./config/database.config.js');

mongoose.Promise = global.Promise;

// Connect to the database
mongoose.connect(dbConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(() => {
  console.log("Successfully connected to the database");
  // Start listening only after successfully connecting to the database
  app.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);
  });
})
.catch(err => {
  console.error('Could not connect to the database. Exiting now...', err);
  process.exit(1); // Exit with failure code
});
