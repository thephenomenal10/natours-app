const User = require('./../models/usersModel');
const catchAsync = require('./../utilis/catchAsync');

exports.getAllUsers = catchAsync(async (req, res) => {
	const users = await User.find();

	res.status(200).json({
		status: 'success',
		results: users.length,
		data: {
			users
		}
	});
});

exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'this route is not yet created !'
	});
};
exports.updateUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'this route is not yet created !'
	});
};
exports.deleteUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'this route is not yet created !'
	});
};
exports.getUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'this route is not yet created !'
	});
};
