const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('./../utilis/appError');

const User = require('./../models/usersModel');
const catchAsync = require('./../utilis/catchAsync');

const signToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		role: req.body.role
		// passwordChangeAt: req.body.passwordChangeAt
	});
	const token = signToken(newUser._id);

	res.status(201).json({
		status: 'success',
		token,
		data: {
			user: newUser
		}
	});
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	//check if email and password exist
	if (!email || !password) {
		return next(new AppError('Please provide email and password', 404));
	}

	//check if user exsits and password is correct

	const user = await User.findOne({ email }).select('+password');
	// const correct = await user.correctPassword(password, user.password);

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Incoorect email or password', 404));
	}

	//if everything is ok, send token the client
	const token = signToken(user.id);
	res.status(200).json({
		status: 'success',
		token
	});
});

exports.protect = catchAsync(async (req, res, next) => {
	// getting th token and check of its there
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}
	// console.log(token);

	if (!token) {
		return next(
			new AppError('you are not logged in !! please log in to get access', 401)
		);
	}
	// verification token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
	// console.log(decoded);

	// check if user still exists
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) {
		return next(
			new AppError('The User belonging to this token is no longer exist')
		);
	}

	// check if user change password after the token was issued
	if (currentUser.changePasswordAfter(decoded.iat)) {
		return next(
			new AppError(
				'User recently changed the password! Please login again',
				401
			)
		);
	}
	// grant access to protectd Route
	req.user = currentUser;
	// console.log(req.user);
	next();
});
