const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

process.on('uncaughtException', err => {
	console.log('unhandled exception , shuting down...');
	console.log(err.name, err.message);
	process.exit(1);
});

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

const port = 3000;
const server = app.listen(port, () => {
	console.log(`app is running on port no ${port}`);
});

process.on('unhandledRejection', err => {
	console.log(err.name, err.message);
	console.log('unhandled rejection , shuting down...');
	server.close(() => {
		process.exit(1);
	});
});
