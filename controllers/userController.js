const User = require('./../models/usersModel');
const catchAsync = require('./../utilis/catchAsync');
const AppError = require('./../utilis/appError');
const factory = require('./handleFactory');

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
	//1. create error if user posted an password data

	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError('this route is not for updating the password', 404)
		);
	}
	//2. Filtered out unwanted fields names  that are not allowed to be updated
	const filteredBody = filterObj(req.body, 'name', 'email');

	//3. Update user document
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true
	});
	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser
		}
	});
});

exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });

	res.status(204).json({
		status: 'success',
		data: null
	});
});

exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User); //***DO NOT UPDATE THE PASSWORD WITH THIS */
exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getOne(User);
