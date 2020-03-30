const Review = require('./../models/reviewModel');
// const catchAsync = require('./../utilis/catchAsync');
const factory = require('./handleFactory');

exports.getAllReviews = factory.getAll(Review);

exports.setTourUserIds = (req, res, next) => {
	//Allow nested routes
	if (!req.body.tour) req.body.tour = req.params.tourId;
	if (!req.body.user) req.body.user = req.user.id;
	next();
};

exports.createReviews = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
exports.delteReview = factory.deleteOne(Review);
