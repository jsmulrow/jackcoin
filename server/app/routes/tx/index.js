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

router.get('/hash/:hash', function(req, res, next) {
    console.log('looking for this hash', req.params.hash);
    Tx.findOne({hash: req.params.hash}).exec()
        .then(function(tx) {
            res.json(tx);
        })
        .then(null, next);
});

router.get('/coins/:address', function(req, res, next) {
    console.log('getting coins for this address: ', req.params.address);
    Tx.find({
        output: {$elemMatch: {address: req.params.address}},
        spent: {$ne: true}
    }).exec()
    .then(function(txs) {
        // copy txs so they aren't mongo objects anymore
        var helperTxs = txs.map(function(tx) {
            return _.pick(tx, ['hash', 'output']);
        });

        // same with the output objects
        helperTxs.forEach(function(tx) {
            tx.output = tx.output.map(function(out) {
                return _.pick(out, ['address', 'amount', 'spent']);
            });
        });

        // attach tx hash to each output
        helperTxs.forEach(function(tx) {
            tx.output.forEach(function(out, idx) {
                out.txHash = tx.hash;
                out.index = idx;
            });
        });

        // only send back the output objects with this address, the amount, and tx hash
        // also only return unspent outputs
        var output = _.chain(helperTxs).pluck('output').flatten().value();
        output = output.filter(function(out) {
            return out.address === req.params.address && !out.spent;
        });

        console.log('got these "coins" ', output);
        res.json(output);
    })
    .then(null, next);
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
