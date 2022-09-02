var express = require('express'),
    secretkey = require('../config/config')["secretkey"];

jwt = require('jsonwebtoken');
mongoose = require('mongoose');
router = express.Router();

var User = require('../models/user');

router.post('/login', function (req, res) {
    if ((req.body.email || req.body.phone) && req.body.password) {
        var qry = {
            password: req.body.password,
            $or: [{
                email: req.body.email
            }, {
                phone: req.body.phone
            }]
        }
        User.findOne(qry, '-new -password').populate({
            path: 'language',
            select: 'name image bg_image',
        })
            .exec(function (err, user) {
                if (err) res.status(500).json({ "error_code": "500", "message": err });
                if (user !== undefined && user !== null) {
                    // if user found then create a token
                    var token = jwt.sign({
                        email: user.email,
                        password: user.password,
                    }, secretkey);
                    var authObj = {
                        data: user,
                        token: token
                    };
                    // return the information including token as JSON
                    res.status(200).send(authObj);
                } else {
                    res.status(200).send({ "error_code": "704", "property": "user", "message": "User Not Found" });
                }
            });
    } else {
        res.status(200).json({ "error_code": "707", "message": "Incomplete params" });
    }
});

router.post('/sign-up', function (req, res) {
    if (req.body.email && req.body.password) {
        var body = req.body;
        var userObj = new User(body);
        userObj.phone = userObj.phone ? userObj.phone : '';
        userObj.save(function (err, user) {
            if (err) {
                fetchErrorType(err, function (error_code, property, message) {
                    if (error_code == "500") {
                        res.status(500).send({ "error_code": error_code, "message": message });
                    } else {
                        res.status(200).send({ "error_code": error_code, "property": property, "message": message });
                    }
                })
            } else {
                res.status(200).send(user);
            }
        })
    } else {
        res.status(200).json({ "error_code": "707", "message": "Incomplete params" });
    }
});

function createSocialSignup(req, callback) {
    // params should be social_id,email,phone
    var body = req.body;
    var userObj = new User(body);
    if (req.files && req.files['avatar']) {
        userObj.pic = typeof req.files != 'undefined' && typeof req.files['avatar'] != 'undefined' && req.files['avatar'].length ? req.files['avatar'][0].filename : '';
    } else {
        userObj.pic = '';
    }
    userObj.dob = '';
    userObj.about = '';
    userObj.language = null;
    userObj.fluency = null;
    userObj.reason = null;
    userObj.password = '';
    userObj.otp = '1234';
    userObj.user_signup_type = 2;
    userObj.is_otp_verified = true;
    userObj.new = true;
    userObj.save(function (err, doc) {
        if (err) {
            callback(err, null);
        } else {
            User.findOne({ "_id": doc._id }).populate({
                select: 'name image',
            }).exec(function (err, user) {
                var token = jwt.sign({
                    email: user.email ? user.email : user.phone,
                }, secretkey);
                var extraDetails = {
                    token: token
                }
                if (!user.email) {
                    user.email = '';
                }
                if (!user.phone) {
                    user.phone = '';
                }
                var finalRes = {
                    data: user,
                    message: "Success"
                }
                if (extraDetails && Object.keys(extraDetails).length) {
                    Object.assign(finalRes, extraDetails)
                }
                callback(null, finalRes);
            })
        }
    })
}

router.post('/social-login', function (req, res) {
    if (req.body.social_id) {
        User.findOne({ "social_id": req.body.social_id }).populate({
            select: 'name',
        }).exec(function (err, user) {
            if (err) res.status(500).json({ "error_code": "500", "message": err });
            if (user !== undefined && user !== null) {
                // if user found then create a token for signin(Social_id exist)
                var token = jwt.sign({
                    email: user.email ? user.email : user.phone,
                }, secretkey);
                if (!user.email) {
                    user.email = '';
                }
                if (!user.phone) {
                    user.phone = '';
                }
                var authObj = {
                    data: user,
                    token: token
                };
                // return the information including token as JSON
                res.status(200).send(authObj);
            } else {
                // if user Not found then Signup or send error(Social_id not exist)
                if (req.body.email || req.body.phone) {
                    checkUserExistWithProp(req.body.email, req.body.phone, function (err, message, is_exist) {
                        if (err) {
                            res.status(500).json({ "error_code": "500", "message": err });
                        } else {
                            if (is_exist) {
                                // send error
                                res.status(200).json({ "error_code": "702", "message": message });
                            } else {
                                //signup
                                createSocialSignup(req, function (err, data) {
                                    if (err) {
                                        fetchErrorType(err, function (error_code, property, message) {
                                            if (error_code == "500") {
                                                res.status(500).send({ "error_code": error_code, "message": message });
                                            } else {
                                                res.status(200).send({ "error_code": error_code, "property": property, "message": message });
                                            }
                                        })
                                    } else {
                                        res.status(200).send(data);
                                    }
                                })
                            }
                        }
                    })
                } else {
                    res.status(200).json({ "error_code": "707", "message": "Incomplete params to create Social User" });
                }
            }
        });
    } else {
        res.status(200).json({ "error_code": "707", "message": "Incomplete params" });
    }
})

function checkUserExistWithProp(email, phone, cb) {
    if (email) {
        User.find({ "email": email }, function (err, doc) {
            if (err) {
                cb(err, null, null);
            } else {
                if (doc.length) {
                    cb(null, 'Email associated with this account already registered', true);
                } else {
                    cb(null, 'Email Not Exist', false);
                }
            }
        })
    } else if (phone) {
        User.find({ "phone": phone }, function (err, doc) {
            if (err) {
                cb(err, null, null);
            } else {
                if (doc.length) {
                    cb(null, 'Phone Number associated with this account already registered', true);
                } else {
                    cb(null, 'Phone Not Exist', false);
                }
            }
        })
    }
}

router.get('/fetch', function (req, res) {
    User.find({}, function (err, doc) {
        res.json(doc);
    })
})

router.post('/change-password', function (req, res) {
    if (req.body.user_id && req.body.old_password && req.body.new_password) {
        User.findById(req.body.user_id, function (err, user) {
            if (err) {
                res.status(500).json({ "error_code": "500", "message": err });
            } else {
                if (user) {
                    if (user.password.trim() === req.body.old_password.toString().trim()) {
                        user.password = req.body.new_password.toString()
                        user.save(function (err, doc) {
                            if (err) {
                                res.status(200).json({ "error_code": "709", "message": "password Not Reset", "error": err });
                            } else {
                                res.status(200).json({ "error_code": "200", "message": "success" });
                            }
                        })
                    } else {
                        res.status(200).json({ "error_code": "708", "message": "Old Password Not Matched" });
                    }
                } else {
                    res.status(200).json({ "error_code": "706", "message": "user_id not exist" });
                }
            }
        })
    } else {
        res.status(200).json({ "error_code": "707", "message": "Incomplete params" });
    }
})


router.post('/user-view-profile', function (req, res) {
    if (req.body.user_id) {
        User.findOne({ "_id": req.body.user_id }).select('-user_languages -password -language -fluency -reason').exec(function (err, user) {
            if (err) {
                res.status(500).send({ "error_code": "500", "message": err });
            } else {
                if (user) {
                    res.status(200).send({ "error_code": "200", "data": user, "message": "success" });
                } else {
                    res.status(200).send({ "error_code": "704", "message": "User Not Found" });
                }
            }
        })
    } else {
        res.status(200).json({ "error_code": "707", "message": "Incomplete params" });
    }
})

router.post('/user-edit-profile', function (req, res) {
    if (req.body.user_id) {
        User.findOne({ "_id": req.body.user_id }).select('-user_languages -password -language -fluency -reason').exec(function (err, user) {
            if (err) {
                res.status(500).send({ "error_code": "500", "message": err });
            } else {
                if (user) {
                    user.email = req.body.email || user.email;
                    user.name = req.body.name || user.name;
                    user.dob = req.body.dob || user.dob;
                    user.phone = req.body.phone || user.phone;
                    user.about = req.body.about || user.about;
                    if (req.files && req.files['avatar']) {
                        user.pic = typeof req.files != 'undefined' && typeof req.files['avatar'] != 'undefined' && req.files['avatar'].length ? req.files['avatar'][0].filename : '';
                    } else {
                        user.pic = user.pic;
                    }
                    user.save(function (err, user) {
                        if (err) {
                            fetchErrorType(err, function (error_code, property, message) {
                                if (error_code == "500") {
                                    res.status(500).send({ "error_code": error_code, "message": message });
                                } else {
                                    res.status(200).send({ "error_code": error_code, "property": property, "message": message });
                                }
                            })
                        } else {
                            res.status(200).send({ "error_code": "200", "data": user, "message": "success" });
                        }
                    })
                } else {
                    res.status(200).send({ "error_code": "704", "message": "User Not Found" });
                }
            }
        })
    } else {
        res.status(200).json({ "error_code": "707", "message": "Incomplete params" });
    }
})

function fetchErrorType(err, cb) {
    console.log(err)
    let count = 0, err_c, prpty, msg;;
    switch (err.name) {
        case 'ValidationError':
            for (field in err.errors) {
                if (count == 0) {
                    switch (err.errors[field].properties.type) {
                        case 'invalid':
                            err_c = "701";
                            count++;
                            cb(err_c, field, "Invalid Format")
                            break;
                        case 'unique':
                            err_c = "702";
                            count++;
                            cb(err_c, field, "Already Exist")
                            break;
                        case 'user defined':
                            err_c = "701";
                            count++;
                            cb(err_c, field, "Invalid Format")
                            break;
                        case 'regexp':
                            err_c = "701";
                            count++;
                            cb(err_c, field, "Invalid Format")
                            break;
                        case 'required':
                            err_c = "703";
                            count++;
                            cb(err_c, field, "Required")
                            break;
                        default:
                            count++;
                            cb("500", null, err)
                    }
                }
            }
            break;
        default:
            cb("500", null, err)
    }
}



module.exports = router;