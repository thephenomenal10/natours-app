const Tour = require('./../models/tourmodel');
const catchAsync = require('./../utilis/catchAsync');
// const AppError = require('./../utilis/appError');
const factory = require('./handleFactory');

exports.aliasTopTours = async (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-price';
	req.query.fields = 'name,price,ratingAverage,summary,difficulty';

	next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
// 	const tour = await Tour.findById(req.params.id).populate('reviews');
// 	//populte is used for getting data from refrencing object from id , as we did to take data of guides from tour
// 	//we use query middleware, so that we do not have to rewrite the code where we need to geta data from a guides
// 	// .populate({
// 	// 	path: 'guides',
// 	// 	select: '-__v -passwordChangeAt'
// 	// });

// 	if (!tour) {
// 		return next(new AppError('No tour found with that ID', 404));
// 	}

// 	res.status(201).json({
// 		status: 'success',
// 		data: {
// 			tour
// 		}
// 	});
// });

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
// 	const newTour = await Tour.create(req.body);
// 	res.status(201).json({
// 		status: 'success',
// 		data: {
// 			tour: newTour
// 		}
// 	});
// });

exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
// 	const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
// 		new: true,
// 		runValidators: true
// 	});
// 	if (!tour) {
// 		return next(new AppError('No tour found with that ID', 404));
// 	}

// 	res.status(201).json({
// 		status: 'success',
// 		data: {
// 			tour
// 		}
// 	});
// });

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
// 	const tour = await Tour.findByIdAndDelete(req.params.id);

// 	if (!tour) {
// 		return next(new AppError('No tour found with that ID', 404));
// 	}
// 	res.status(202).json({
// 		status: 'success',
// 		data: {
// 			tour: null
// 		}
// 	});
// });

exports.tourStats = catchAsync(async (req, res, next) => {
	const stats = await Tour.aggregate([
		{
			$match: { ratingAverage: { $lt: 4.5 } }
		},
		{
			$group: {
				_id: { $toUpper: '$difficulty' },
				numTours: { $sum: 1 },
				avgRating: { $avg: '$ratingAverage' },
				avgPrice: { $avg: '$price' },
				minPrice: { $min: '$price' },
				maxPrice: { $max: '$price' }
			}
		},

		{
			$sort: { avgPrice: 1 }
		}
		// {
		// 	$match: { _id: { $ne: 'EASY' } }
		// }
	]);
	res.status(202).json({
		status: 'success',
		data: {
			tour: stats
		}
	});
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
	const year = req.params.year * 1;
	const plan = await Tour.aggregate([
		{
			$unwind: '$startDates'
		},
		{
			$match: {
				startDates: {
					$gte: new Date(`${year}-01-01`),
					$lte: new Date(`${year}-12-31`)
				}
			}
		},
		{
			$group: {
				_id: { $month: '$startDates' },
				numTourStarts: { $sum: 1 },
				tours: { $push: '$name' }
			}
		},
		{
			$addFields: { month: '$_id' }
		},
		{
			$project: { _id: 0 }
		},
		{
			$sort: { numTourStarts: -1 }
		},
		{
			$limit: 12
		}
	]);

	res.status(202).json({
		status: 'success',
		data: {
			tour: plan
		}
	});
});
