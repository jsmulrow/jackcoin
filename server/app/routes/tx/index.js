'use strict';
var router = require('express').Router();
var _ = require('lodash');
var mongoose = require('mongoose');
var Tx = mongoose.model('Tx');

router.get('/', function(req, res, next) {
    Tx.find(req.query).exec()
        .then(function(txs) {
            console.log('found these tx', txs);
            res.json(txs);
        })
        .then(null, next);
});

router.post('/', function(req, res, next) {
    var u = new Tx(req.body);
    u.save()
        .then(function(tx) {
            res.status(200).send({
                tx: _.omit(tx.toJSON(), ['password', 'salt'])
            });
        });
});

router.param('id', function(req, res, next, id) {
    Tx.findById(id).exec()
        .then(function(tx) {
            if (!tx) throw Error('Not Found');
            req.tx = tx;
            next();
        })
        .then(null, function(e) {
            // invalid ids sometimes throw cast error
            if (e.name === "CastError" || e.message === "Not Found") e.status = 404;
            next(e);
        });
});

router.get('/:id', function(req, res) {
    res.json(req.tx);
});

router.put('/:id', function(req, res, next) {
    _.extend(req.tx, req.body);
    req.tx.save()
        .then(function(tx) {
            res.json(tx);
        })
        .then(null, next);
});

router.delete('/:id', function(req, res, next) {
    req.tx.remove()
        .then(function() {
            res.status(204).end();
        })
        .then(null, next);
});

module.exports = router;
