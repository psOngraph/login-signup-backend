const express = require('express'),
    bodyParser = require('body-parser'),
    connection = require('./server/config/db.config'),
    expressSession = require('express-session'),
    logger = require('morgan')
cors = require('cors'),
    apiRoutes = require('./server/routes/apiRoutes'),
    app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Point static path to dist

app.use('/public', express.static(__dirname + '/public'))

// app.set('view engine', 'html');
/* log each request */
app.use(logger('dev'))
// CORS
app.use(cors())
//session
app.use(expressSession({
    secret: 'mytoken',
    saveUninitialized: true,
    resave: true
}));
//Routes goes here
app.use('/v1/api', apiRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: (app.get('env') === 'development') ? err : {}
    });
});

const port = process.env.PORT || 1300;
app.listen(port, function () {
    console.log(`App listening on port ${port}`);
});
