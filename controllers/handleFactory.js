//this file or function is actually created because we have to write the code again again for delete the tour, review and other documents by the same actually,
// so we her now write a single code to delter the respective documetn on calling the function.

const catchAsync = require('./../utilis/catchAsync');
const AppError = require('./../utilis/appError');
const APIFeatures = require('./../utilis/apiFeatures');

exports.deleteOne = Model =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}
		res.status(202).json({
			status: 'success',
			data: null
		});
	});

exports.updateOne = Model =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		});
		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		res.status(201).json({
			status: 'success',
			data: {
				data: doc
			}
		});
	});

exports.createOne = Model =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.create(req.body);
		res.status(201).json({
			status: 'success',
			data: {
				data: doc
			}
		});
	});

exports.getOne = (Model, popoptions) =>
	catchAsync(async (req, res, next) => {
		let query = Model.findById(req.params.id);
		if (popoptions) query = query.populate(popoptions);
		const doc = await query;

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		res.status(201).json({
			status: 'success',
			data: {
				data: doc
			}
		});
	});

exports.getAll = Model =>
	catchAsync(async (req, res, next) => {
		let filter = {};
		if (req.params.tourId) filter = { tour: req.params.tourId };
		const features = new APIFeatures(Model.find(filter), req.query)
			.filter()
			.sort()
			.limitFields()
			.paginate();
		const doc = await features.query;

		res.status(200).json({
			status: 'success',
			results: doc.length,
			data: {
				data: doc
			}
		});
	});
