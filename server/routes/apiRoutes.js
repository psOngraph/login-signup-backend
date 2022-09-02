const express = require('express'),
    router = express.Router(),
    secretkey = require('../config/config')["secretkey"];
multer = require('multer');
path = require('path');
crypto = require('crypto');
mime = require('mime');

const appRoutes = {
    publicRoutes: ["/users/login", "/users/sign-up"],
    userRoutes: ["/users/complete-profile"]
}

const BASE_PATH = path.resolve();

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, BASE_PATH + '/public/files');
    },
    filename: function (req, file, callback) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            var ext = String(file.mimetype).indexOf('jpg') === -1 ? mime.getExtension(file.mimetype) : 'jpg';
            callback(null, raw.toString('hex') + Date.now() + '.' + ext);
        });
    }
});

var upload = multer({
    storage: storage
}).fields([{ name: 'avatar', maxCount: 1 }, { name: 'bg_image', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]);

// Function to upload project images
// var questionImg = multer({ storage: storage }).any('uploadedImages');
router.use(function (req, res, next) {
    if (appRoutes.publicRoutes.indexOf(req.url) >= 0) {
        next();
    } else {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, secretkey, function (err, decoded) {
                if (err) {
                    return res.json({ success: false, error_code: 406, message: 'Failed to authenticate token.' });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.',
                error_code: 406
            });
        }
    }
})

router.use("/users", upload, require('../controller/user'));

module.exports = router;


