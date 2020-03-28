const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please tell your name'],
		trim: true
	},
	email: {
		type: String,
		required: [true, 'Please provide your email'],
		validate: [validator.isEmail, 'Please provide your email'],
		// match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, `Please fill valid email address`],
		unique: true,
		lowercase: true
	},
	photo: String,
	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user'
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
		select: false
	},
	passwordConfirm: {
		type: String,
		required: [true, 'PLease confirm your password'],
		validate: {
			// this only works on save and save
			validator: function(el) {
				return el === this.password;
			},
			message: 'Password are not the same'
		}
	},
	passwordChangeAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date
});

userSchema.pre('save', async function(next) {
	//only runs this function when the password  was acrtually modified
	if (!this.isModified('password')) return next();

	//hash the [assword with cost of 12
	this.password = await bcrypt.hash(this.password, 12);
	// delter the passwordconfirm field
	this.passwordConfirm = undefined;
	next();
});

userSchema.pre('save', function(next) {
	if (!this.isModified('password') || this.isNew) return next();

	this.passwordChangeAt = Date.now() - 1000;
	next();
});

//instance method
userSchema.methods.correctPassword = async function(
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
	if (this.passwordChangeAt) {
		const changedTimeStamp = parseInt(
			this.passwordChangeAt.getTime() / 1000,
			10
		);
		console.log(changedTimeStamp, JWTTimestamp);

		return JWTTimestamp < changedTimeStamp;
	}
	// false means password not changed
	return false;
};

userSchema.methods.createPasswordResetToken = function() {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	console.log({ resetToken }, this.passwordResetToken);

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
