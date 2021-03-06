const mongoose = require('mongoose');
const Tour = require('./tourmodel');

const reviewSchema = new mongoose.Schema(
	{
		review: {
			type: String,
			required: [true, 'Review cant be empty!']
		},
		rating: {
			type: Number,
			min: 1,
			max: 5
		},
		createdAt: {
			type: Date,
			default: Date.now
		},
		tour: {
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'Review must belong to a tour']
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Review must belong to a user']
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

reviewSchema.pre(/^find/, function(next) {
	// this.populate({
	// 	path: 'tour',
	// 	select: 'name'
	// }).populate({
	// 	path: 'user',
	// 	select: 'name photo'
	// });

	this.populate({
		path: 'user',
		select: 'name photo'
	});
	next();
});

// for calculating average rating and no. of rating given by user on current tour
reviewSchema.statics.calcAverageRating = async function(tourId) {
	const stats = await this.aggregate([
		{
			$match: { tour: tourId }
		},
		{
			$group: {
				_id: '$tour',
				nRating: { $sum: 1 },
				avgRating: { $avg: '$rating' }
			}
		}
	]);
	console.log(stats);
	//here we save the save the stats of the currrent document
	if (stats.length > 0) {
		await Tour.findByIdAndUpdate(tourId, {
			ratingQuantity: stats[0].nRating,
			ratingAverage: stats[0].avgRating
		});
	} else {
		await Tour.findByIdAndUpdate(tourId, {
			ratingQuantity: 0,
			ratingAverage: 4.5
		});
	}
};
//callina a calcAverageRating function by using thos.constructor
reviewSchema.post('save', function() {
	// this points to the current review
	this.constructor.calcAverageRating(this.tour);
});

//findByIdAndUpdate
//findByIdAnd Delete
reviewSchema.pre(/^findOneAnd/, async function(next) {
	this.r = await this.findOne();
	console.log(this.r);
	next();
});

reviewSchema.post(/^findOneAnd/, async function() {
	//await this .findOne(); does not work here, query has already executed
	await this.r.constructor.calcAverageRating(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
