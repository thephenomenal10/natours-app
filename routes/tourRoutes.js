const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

//post /tour/wwfww2f/reviews
// GET /tour/wfer43gef/reviews
// GET /tour/faegferd/reviews/wfsce23r23
// alternative of this code is just below line of this commented code
// router
// 	.route('/:tourId/reviews')
// 	.post(
// 		authController.protect,
// 		authController.restrictTo('user'),
// 		reviewController.createReviews
// 	);

router.use('/:tourId/reviews', reviewRouter);

router.route('/tourStats').get(tourController.tourStats);

router
	.route('/monthly-plan/:year')
	.get(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide', 'guide'),
		tourController.getMonthlyPlan
	);

router
	.route('/tours-within/:distance/center/:latlng/unit/:unit')
	.get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
	.route('/top-5-cheap')
	.get(tourController.aliasTopTours, tourController.getAllTours);

router
	.route('/')
	.get(tourController.getAllTours)
	.post(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.createTour
	);

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.updateTour
	)
	.delete(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.deleteTour
	);

module.exports = router;
