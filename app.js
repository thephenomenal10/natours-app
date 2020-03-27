/* eslint-disable no-use-before-define */
const express = require('express');
const morgan = require('morgan');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utilis/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

const app = express();
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
	console.log('hello from the middleware');
	next();
});

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	// console.log(req.headers);

	next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`cant find url ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
