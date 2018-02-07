var mongoose = require('mongoose'); // Import Mongoose Package
var Schema = mongoose.Schema; // Assign Mongoose Schema function to variable

mongoose.Promise = global.Promise;
var ProductSchema = new Schema({
    data : {}
});


module.exports = mongoose.model('Product', ProductSchema);