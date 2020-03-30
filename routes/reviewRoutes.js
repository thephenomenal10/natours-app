const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

// /work for both given request
//post /tour/faergegre/reviews
//post /reviews
router
	.route('/')
	.get(reviewController.getAllReviews)
	.post(
		authController.protect,
		authController.restrictTo('user'),
		reviewController.setTourUserIds,
		reviewController.createReviews
	);

router
	.route('/:id')
	.get(reviewController.getReview)
	.patch(reviewController.updateReview)
	.delete(reviewController.delteReview);

module.exports = router;
