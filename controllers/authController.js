const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('./../utilis/appError');

const User = require('./../models/usersModel');
const catchAsync = require('./../utilis/catchAsync');
const sendEmail = require('./../utilis/email');

//authentication
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

//autorization
exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		// roles ['admin', 'lead-guide',]. role=['user']
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError('you dont have permission to perform this action', 403)
			);
		}
		next();
	};
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	//1. get user base on posted email\
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError('There is no user with this email address.', 404));
	}

	//2. generate the random  reset token
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });
	//3. send it to user's email
	const resetURL = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/users/resetPassword/${resetToken}`;
	// console.log(resetURL);

	const message = `forgot your password? Submit the patch request with the new  password and confirm password to: ${resetURL}`;

	try {
		await sendEmail({
			email: user.email, //or we can say:  req.body.email
			subject: 'Your password reset token valid for 10 min',
			message
		});

		res.status(202).json({
			status: 'success',
			message: 'Token send to the email'
		});
	} catch (err) {
		user.PasswordRestToken = undefined;
		user.PasswordRestExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(
			new AppError('there was an error sending the email, try again later', 500)
		);
	}
});

exports.resetPassword = catchAsync(async (req, res, next) => {
	//1 get user based on the token

	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() }
	});
	//2 if token has not expired, and there is user, set the new password

	if (!user) {
		return next(new AppError('Token is invalid or expired,', 404));
	}
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();
	//3. update changePAsswordAt property for the user
	//4 log the user in , send the JWT
	const token = signToken(user.id);
	res.status(200).json({
		status: 'success',
		token
	});
});
