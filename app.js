/* eslint-disable no-use-before-define */
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const XSS = require('xss-clean');
const hpp = require('hpp');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utilis/appError');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

//SET SECURITY HTTP HEADERS
app.use(helmet());

//1. GLOBAL MIDDLEWARE
//DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
// LIMIT REQUEST FROM SAME API
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'To many request from this IP , try again  in an hour'
});

app.use('/api', limiter);

//BODY PARSER, READING DATA FROM BODY INOT REQ.BODY
app.use(express.json({ limit: '10kb' }));

//Data sanitization agsinst no sql injection
app.use(mongoSanitize());
// data sanitization against XSS(croos site scripting)
app.use(XSS());

//prevent parameter pollution
app.use(
	hpp({
		whitelist: [
			'duration',
			'ratingQuantity',
			'ratingAverage',
			'maxGrouSize',
			'difficulty',
			'price'
		]
	})
);

//serving static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
	console.log('hello from the middleware');
	next();
});

//TESTING MIDDLEWARE
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	// console.log(req.headers);

	next();
});

//ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`cant find url ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
