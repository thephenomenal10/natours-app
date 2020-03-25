const Tour = require('./../models/tourmodel');
const APIFeatures = require('./../utilis/apiFeatures');

exports.aliasTopTours = async (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-price';
	req.query.fields = 'name,price,ratingAverage,summary,difficulty';

	next();
};

exports.getAllTours = async (req, res) => {
	try {
		// const tours = await Tour.find()
		// 	.where('duration')
		// 	.equals(5)
		// 	.where('difficulty')
		// 	.equals('easy');

		//BUILD THE QUERY
		//filtering
		// const queryObj = { ...req.query };
		// const excludeFields = ['page', 'sort', 'limit', 'fields'];
		// excludeFields.forEach(el => delete queryObj[el]);

		// //2 advance filtering
		// let queryStr = JSON.stringify(queryObj);
		// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
		// console.log(JSON.parse(queryStr));

		// console.log(req.query, queryObj);

		// let query = Tour.find(JSON.parse(queryStr));

		//3 sorting
		// if (req.query.sort) {
		// 	const sortBy = req.query.sort.split(' ').join(' ');
		// 	console.log(sortBy);
		// 	query = query.sort(sortBy);
		// } else {
		// 	query = query.sort('-createdAt');
		// }

		//FIELDS LIMITING
		// if (req.query.fields) {
		// 	const fields = req.query.fields.split(',').join(' ');
		// 	query = query.select(fields);
		// } else {
		// 	query = query.select('-__v');
		// }

		//Pagination

		// const page = req.query.page * 1 || 1;
		// const limit = req.query.limit * 1 || 100;
		// const skip = (page - 1) * limit;
		// query = query.skip(skip).limit(limit);

		// if (req.query.page) {
		// 	const numTours = await Tour.countDocuments();
		// 	if (skip >= numTours) throw new Error('this pag does not exist');
		// }
		//EXECUTE THE QUERY
		const features = new APIFeatures(Tour.find(), req.query)
			.filter()
			.sort()
			.limitFields()
			.paginate();
		const tours = await features.query;

		res.status(200).json({
			status: 'success',
			results: tours.length,
			data: {
				tours
			}
		});
	} catch (err) {
		res.status(404).json({
			status: 'fail',
			message: err
		});
	}
};

exports.getTour = async (req, res) => {
	try {
		const tour = await Tour.findById(req.params.id);
		res.status(201).json({
			status: 'success',
			data: {
				tour
			}
		});
	} catch (error) {
		res.status(404).json({
			status: 'fail',
			message: 'Invalid data sent'
		});
	}
};

exports.createTour = async (req, res) => {
	try {
		const newTour = await Tour.create(req.body);
		res.status(201).json({
			status: 'success',
			data: {
				tour: newTour
			}
		});
	} catch (err) {
		res.status(404).json({
			status: 'fail',
			message: err
		});
	}
};

exports.updateTour = async (req, res) => {
	try {
		const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		});
		res.status(201).json({
			status: 'success',
			data: {
				tour
			}
		});
	} catch (error) {
		res.status(404).json({
			status: 'fail',
			message: 'Invalid data sent'
		});
	}
};

exports.deleteTour = async (req, res) => {
	try {
		await Tour.findByIdAndDelete(req.params.id);
		res.status(202).json({
			status: 'success',
			data: {
				tour: null
			}
		});
	} catch (error) {
		res.status(404).json({
			status: 'fail',
			message: 'Invalid data sent'
		});
	}
};

exports.tourStats = async (req, res) => {
	try {
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
	} catch (error) {
		res.status(404).json({
			status: 'fail',
			message: 'Invalid data sent'
		});
	}
};
exports.getMonthlyPlan = async (req, res) => {
	try {
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
	} catch (error) {
		res.status(404).json({
			status: 'fail',
			message: error
		});
	}
};
