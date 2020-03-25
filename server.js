const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

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
app.listen(port, () => {
	console.log(`app is running on port no ${port}`);
});
