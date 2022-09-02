var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    _id: { type: mongoose.Schema.ObjectId, auto: true },
    social_id: { type: String, unique: true, index: true, sparse: true },
    user_signup_type: { type: Number, default: 1 },//1 for Normal User,2 for Social User
    name: { type: String },
    email: { type: String, lowercase: true, unique: true, index: true, sparse: true },
    phone: { type: String, unique: true, index: true, sparse: true },
    password: { type: String },
    device_token: { type: String },
    //Advance Details
    pic: { type: String },
    dob: { type: String },
    about: { type: String },
    //Time Stamp
    timestamp: { type: Date, required: true, default: Date.now }
});

userSchema.plugin(uniqueValidator, { message: 'is already taken.' });


module.exports = mongoose.model('User', userSchema);