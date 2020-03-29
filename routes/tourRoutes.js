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

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
	.route('/top-5-cheap')
	.get(tourController.aliasTopTours, tourController.getAllTours);

router
	.route('/')
	.get(authController.protect, tourController.getAllTours)
	.post(tourController.createTour);

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(tourController.updateTour)
	.delete(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.deleteTour
	);

module.exports = router;
