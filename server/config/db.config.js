var mongoose = require('mongoose');
dbconfig = require('./config')['dbconfig'];

let connection;
var config = dbconfig['production'];
connection = mongoose.connect(`${config.database.uri}`);
module.exports = connection;
// if (process.env.NODE_ENV === 'development') {
    // var config = dbconfig['development'];
    // connection = mongoose.connect(`mongodb://${config.database.host}:${config.database.port}/${config.database.db}`);
// } else {
//     var config = dbconfig['production'];
//     connection = mongoose.connect(`mongodb://${config.database.MONGO_USERNAME}:${config.database.MONGO_PASSWORD}@${config.database.HOST}:${config.database.MONGO_PORT}/${config.database.MONGO_DB}?authSource=${config.database.MONGO_AUTH_DB}`);
// }


