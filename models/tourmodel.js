const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			unique: true,
			required: [true, 'A tour must have a name'],
			trim: true,
			maxlength: [40, 'the tour must have a 40 or less than chacter'],
			minlength: [10, 'the tour must have a 10 or more than chacter']
		},
		slug: String,
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration']
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a group size']
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a diffulty level'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'difficulty is either: easy, medium, difficult'
			}
		},
		ratingAverage: {
			type: Number,
			default: 0
		},
		ratingQuantity: {
			type: Number,
			default: 0
		},
		price: {
			type: Number,
			required: [true, 'A tour must have a price']
		},
		priceDiscount: {
			type: Number,
			validate: function(val) {
				//this only points to current document or new creation of document not point to the update document......//
				return val < this.price;
			},
			message: 'Discount price ({VALUE}) should be below regular price'
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A tour must have description']
		},
		description: {
			type: String,
			trim: true
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a cover image']
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false
		},
		startDates: [Date],
		secretTour: {
			type: Boolean,
			default: false
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

tourSchema.virtual('durationWeeks').get(function() {
	return this.duration / 7;
});

//DOCUMENT midleware runs before the .save(), and .create()
tourSchema.pre('save', function(next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

// tourSchema.pre('save', function(next) {
// 	console.log('will save document...');

// 	next();
// });

// tourSchema.post('save', function(doc, next) {
// 	console.log(doc);
// 	next();
// });

tourSchema.pre(/^find/, function(next) {
	// tourSchema.pre('find', function(next) {
	this.find({ secretTour: { $ne: true } });
	this.start = Date.now();
	next();
});
tourSchema.post(/^find/, function(docs, next) {
	this.find({ secretTour: { $ne: true } });
	console.log(
		`Time taken by the query to be executed  ${Date.now() -
			this.start} millisecond`
	);
	console.log(docs);
	next();
});

//AGGRIGATION middleware
tourSchema.pre('aggregate', function(next) {
	this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
	console.log(this.pipeline());

	next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
