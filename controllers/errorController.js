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

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack
	});
};

const sendErrorProd = (err, res) => {
	// Operational, trusted error: send message to client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message
		});

		// Programming or other unknown error: don't leak error details
	} else {
		// 1) Log error
		console.error('ERROR 💥', err);

		// 2) Send generic message
		res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!'
		});
	}
};

module.exports = (err, req, res, next) => {
	// console.log(err.stack);

	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';
	console.log(process.env.NODE_ENV);
	if (process.env.NODE_ENV === 'DEVELOPMENT') {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };

		if (error.name === 'CastError') error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error.name === 'ValidationError')
			error = handleValidationErrorDB(error);
		sendErrorProd(error, res);
	}
};
