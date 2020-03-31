const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourmodel');
const User = require('./../../models/usersModel');
const Review = require('./../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
	'<password>',
	process.env.DATABASE_PASSWORD
);

mongoose
	// .connect(process.env.DATABASE_LOCAL, {  /use for locally connected database
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false
	})
	.then(() => {
		console.log('DB connections Successfull!!');
	});

///reading file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
	fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//importing data into DB
const importData = async () => {
	try {
		await Tour.create(tours);
		await Review.create(reviews);
		await User.create(users, { validateBeforeSave: false });
		console.log('importing data successfuly');
	} catch (error) {
		console.log(error);
	}
	process.exit();
};

//delete data from database

const deleteData = async () => {
	try {
		await Tour.deleteMany();
		await Review.deleteMany();
		await User.deleteMany();
		console.log('data deleted successfuly');
	} catch (error) {
		console.log(error);
	}
	process.exit();
};

console.log(process.argv);

if (process.argv[2] === '--import') {
	importData();
} else if (process.argv[2] === '--delete') {
	deleteData();
}
