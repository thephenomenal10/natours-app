const Tour = require('../models/tourmodel');
const User = require('../models/usersModel');
const catchAsync = require('../utilis/catchAsync');
const AppError = require('./../utilis/appError');

exports.getOverview = catchAsync(async (req, res) => {
	// 1. get tour data from the collection
	const tours = await Tour.find();
	//2. build the tempate
	//3. render that template using tour data from 1

	res.status(200).render('overview', {
		title: 'All Tour',
		tours
	});
});

exports.getTour = catchAsync(async (req, res, next) => {
	//1 get the data for the requested tour guide (including reviews and guides)\
	const tour = await Tour.findOne({ slug: req.params.slug }).populate({
		path: 'reviews', // path define the document, here reviews is the document name
		fields: 'review rating user' // fields are those whic we want from the that document
	});

	if (!tour) {
		return next(new AppError('there is not tour with that tour name', 404));
	}
	//build the template
	// render templete using the data from 1 step

	res.status(200).render('tour', {
		title: `${tour.name} Tour`,
		tour
	});
});
exports.getLoginForm = (req, res) => {
	res.status(200).render('login', {
		title: 'Login to your account'
	});
};

exports.getAccount = (req, res) => {
	res.status(200).render('account', {
		title: 'your account'
	});
};

exports.updateUserData = catchAsync(async (req, res, next) => {
	const updateUser = await User.findByIdAndUpdate(
		req.user.id,
		{
			name: req.body.name,
			email: req.body.email
		},
		{
			new: true,
			runValidators: true
		}
	);
	res.status(200).render('account', {
		title: 'Your Account',
		user: updateUser
	});
});
