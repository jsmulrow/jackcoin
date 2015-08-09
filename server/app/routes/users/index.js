'use strict';
var router = require('express').Router();
var _ = require('lodash');
var mongoose = require('mongoose');
var User = mongoose.model('User');

// only send out public addresses of users
router.get('/', function(req, res, next) {
    User.find(req.query).exec()
        .then(function(users) {
            var output = [];
            var len = users.length;
            for (var i = 0; i < len; i++) {
                output.push(users[i].publicAddress);
            }
            res.json(output);
        })
        .then(null, next);
});

router.post('/', function(req, res, next) {
    var u = new User(req.body);
    u.save()
        .then(function(user) {
            res.status(200).send({
                user: _.omit(user.toJSON(), ['password', 'salt'])
            });
        });
});

router.get('/test', function(req, res, next) {
    User.find().exec()
        .then(function(users) {
            users.forEach(function(u) {
                console.log(u.email, u.publicAddress);
            });
            res.json(users);
        })
        .then(null, next);
});

router.param('id', function(req, res, next, id) {
    User.findById(id).exec()
        .then(function(user) {
            if (!user) throw Error('Not Found');
            req.user = user;
            next();
        })
        .then(null, function(e) {
            // invalid ids sometimes throw cast error
            if (e.name === "CastError" || e.message === "Not Found") e.status = 404;
            next(e);
        });
});

router.get('/:id', function(req, res) {
    res.json(req.user);
});

router.put('/:id', function(req, res, next) {
    _.extend(req.user, req.body);
    req.user.save()
        .then(function(user) {
            res.json(user);
        })
        .then(null, next);
});

router.delete('/:id', function(req, res, next) {
    req.user.remove()
        .then(function() {
            res.status(204).end();
        })
        .then(null, next);
});

module.exports = router;
