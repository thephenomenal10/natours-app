/* eslint-disable no-use-before-define */
const path = require('path');
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
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//SET SECURITY HTTP HEADERS
app.use(helmet());

//1. GLOBAL MIDDLEWARE
//serving static files
app.use(express.static(path.join(__dirname, 'public')));

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

app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`cant find url ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
