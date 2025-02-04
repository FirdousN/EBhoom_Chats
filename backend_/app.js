const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const db = require('./lib/db'); // Import the database connection function
const cors = require("cors");
const createError = require('http-errors');
const path = require('path');
const { app, server } = require("./lib/socket")

const usersRouter = require('./routes/users.route');
const messageRouter = require('./routes/message.route');

const PORT = process.env.PORT

// Connect to MongoDB
db();  // Make sure you are calling the function here to establish the connection

// add cors
app.use(cors({
  origin: 'http://localhost:5173', // Add multiple origins if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.options('*', cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', PORT);

app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/messages', messageRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // In case the error handler is triggered, respond with JSON
  if (req.xhr || req.accepts('json')) {
    res.status(err.status || 500).json({
      message: err.message,
      error: req.app.get('env') === 'development' ? err : {}
    });
  } else {
    // For non-JSON requests, fall back to default behavior
    res.status(err.status || 500).send('Something went wrong!');
  }
});

// Create HTTP server and initialize socket
server.listen(PORT || 3000, () => {
  console.log(`App started on PORT ${server.address().port}`);
})


module.exports = app;