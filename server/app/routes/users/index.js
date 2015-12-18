'use strict';
var router = require('express').Router();
var _ = require('lodash');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Tx = mongoose.model('Tx');
var sha256 = require('crypto-hashing').sha256;

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
    console.log('posting a user');
    var responseUser;
    var u = new User(req.body);
    u.save()
        .then(function(user) {
            console.log('saved the use', user);
            responseUser = user;
            // give the user some JackCoin
            var txInfo = {
                input: [
                    {
                        address: 'NewUserSeed',
                        amount: 500
                    }
                ],
                output: [
                    {
                        address: user.publicAddress,
                        amount: 500
                    }
                ]
            };
            txInfo.hash = txHash(txInfo.input, txInfo.output);
            var t = new Tx(txInfo);
            return t.save();
        })
        .then(function() {
            res.status(200).send({
                user: _.omit(responseUser.toJSON(), ['password', 'salt'])
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

// functions for giving new users JackCoin
// hashes a tx
function txHash(input, output, pastTxHash) {
    pastTxHash = pastTxHash || '';
    // check for coinbase
    if (output[0].coinbase) {
        pastTxHash = randString(10);
    }
    // join addresses together in order
    var addresses = input.concat(output);
    addresses = _.pluck(addresses, 'address');
    addresses = addresses.join('') + pastTxHash;
    // return sha256 hash in hexadecimal
    return sha256(addresses).toString('hex');
}

function randString(len) {
    var output = [];
    for (var i = 0; i < len; i++) {
        output.push(randDigit())
    }
    return output.join('');
}

function randDigit() {
    return Math.ceil(Math.random() * 10);
}
