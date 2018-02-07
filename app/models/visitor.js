var mongoose = require('mongoose'); // Import Mongoose Package
var Schema = mongoose.Schema; // Assign Mongoose Schema function to variable
var bcrypt = require('bcrypt-nodejs'); // Import Bcrypt Package

mongoose.Promise = global.Promise;
var VisitorSchema = new Schema({
    password: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    favorite : [{
        description : {type:String},
        cname : {type:String},
        imgUrl : {type:String},
        listname:{type:String},
    }],
    confirm_code : {type:String}
});

VisitorSchema.pre('save', function(next) {
    var visitor = this;

    if (!visitor.isModified('password')) return next(); // If password was not changed or is new, ignore middleware

    // Function to encrypt password 
    bcrypt.hash(visitor.password, null, null, function(err, hash) {
        if (err) return next(err); // Exit if error is found
        visitor.password = hash; // Assign the hash to the visitor's password so it is saved in database encrypted
        next(); // Exit Bcrypt function
    });
});

VisitorSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password); // Returns true if password matches, false if doesn't
};

module.exports = mongoose.model('Visitor', VisitorSchema); // Export User Model for us in API
