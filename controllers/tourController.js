const Tour = require('./../models/tourmodel');
const catchAsync = require('./../utilis/catchAsync');
const AppError = require('./../utilis/appError');
const factory = require('./handleFactory');

exports.aliasTopTours = async (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-price';
	req.query.fields = 'name,price,ratingAverage,summary,difficulty';

	next();
};

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.getAllTours = factory.getAll(Tour);

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
	const { distance, latlng, unit } = req.params;
	const [lat, lng] = latlng.split(',');

	// convert into radians
	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

	if (!lat || !lng) {
		next(new AppError('Please provide in the format like this lat, lng', 404));
	}

	const tours = await Tour.find({
		startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
	});

	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			data: tours
		}
	});
});

exports.getDistances = catchAsync(async (req, res, next) => {
	const { latlng, unit } = req.params;
	const [lat, lng] = latlng.split(',');

	if (!lat || !lng) {
		next(new AppError('Please provide in the format like this lat, lng', 404));
	}

	const distances = await Tour.aggregate([
		{
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [lng * 1, lat * 1]
				},
				distanceField: 'distance'
			}
		}
	]);
	res.status(200).json({
		status: 'success',
		data: {
			data: distances
		}
	});
});
