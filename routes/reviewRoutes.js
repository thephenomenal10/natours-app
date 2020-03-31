const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

// /work for both given request
//post /tour/faergegre/reviews
//post /reviews
router.use(authController.protect);

router
	.route('/')
	.get(reviewController.getAllReviews)
	.post(
		authController.restrictTo('user'),
		reviewController.setTourUserIds,
		reviewController.createReviews
	);

router
	.route('/:id')
	.get(reviewController.getReview)
	.patch(
		authController.restrictTo('user', 'admin'),
		reviewController.updateReview
	)
	.delete(
		authController.restrictTo('user', 'admin'),
		reviewController.delteReview
	);

module.exports = router;
