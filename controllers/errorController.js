const AppError = require('./../utilis/appError');

const handleValidationErrorDB = err => {
	const errors = Object.values(err.errors).map(el => el.message);
	const message = `Invalid valid data ${errors.join('. ')}`;
	return new AppError(message, 400);
};

const handleCastErrorDB = err => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new AppError(message, 404);
};

const handleDuplicateFieldsDB = err => {
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
	const message = `Duplicate fields value: ${value}, please use naother value`;
	return new AppError(message, 404);
};

const sendErrorDev = (err, req, res) => {
	if (req.originalUrl.startsWith('/api')) {
		//A) API
		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack
		});
	}

	//B) RENDERING WEBSITE
	return res.status(err.statusCode).render('error', {
		title: 'something went wrong',
		msg: err.message
	});
};
const handleJWTError = () =>
	new AppError('Invalid token, pleaselogin again!', 401);

const handleJWTExpireError = () =>
	new AppError('your token has expired , please login again', 401);

const sendErrorProd = (err, req, res) => {
	//API
	if (req.originalUrl.startsWith('/api')) {
		// Operational, trusted error: send message to client

		if (err.isOperational) {
			res.status(err.statusCode).json({
				status: err.status,
				message: err.message
			});

			// Programming or other unknown error: don't leak error details
		}
		// 1) Log error
		console.error('ERROR 💥', err);

		// 2) Send generic message
		return res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!'
		});
	}
	//B for render page
	if (err.isOperational) {
		res.status(err.statusCode).render('error', {
			title: 'something went wrong',
			msg: err.message
		});
		// Programming or other unknown error: don't leak error details
	}
	// 1) Log error
	console.error('ERROR 💥', err);

	// 2) Send generic message
	res.status(500).json({
		status: 'error',
		message: 'please try again later'
	});
};

module.exports = (err, req, res, next) => {
	// console.log(err.stack);

	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';
	console.log(process.env.NODE_ENV);
	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };
		error.message = err.message;

		if (error.name === 'CastError') error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error.name === 'ValidationError')
			error = handleValidationErrorDB(error);
		if (error.name === 'JsonWebTokenError') error = handleJWTError();
		if (error.name === 'TokenExpiredError') error = handleJWTExpireError();

		sendErrorProd(error, req, res);
	}
};
