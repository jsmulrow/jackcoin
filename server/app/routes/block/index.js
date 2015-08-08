'use strict';
var router = require('express').Router();
var _ = require('lodash');
var mongoose = require('mongoose');
var Block = mongoose.model('Block');

router.get('/', function(req, res, next) {
    Block.find(req.query).exec()
        .then(function(blocks) {
            res.json(blocks);
        })
        .then(null, next);
});

router.post('/', function(req, res, next) {
    var u = new Block(req.body);
    u.save()
        .then(function(block) {
            res.status(200).send({
                block: _.omit(block.toJSON(), ['password', 'salt'])
            });
        });
});

router.param('id', function(req, res, next, id) {
    Block.findById(id).exec()
        .then(function(block) {
            if (!block) throw Error('Not Found');
            req.block = block;
            next();
        })
        .then(null, function(e) {
            // invalid ids sometimes throw cast error
            if (e.name === "CastError" || e.message === "Not Found") e.status = 404;
            next(e);
        });
});

router.get('/:id', function(req, res) {
    res.json(req.block);
});

router.put('/:id', function(req, res, next) {
    _.extend(req.block, req.body);
    req.block.save()
        .then(function(block) {
            res.json(block);
        })
        .then(null, next);
});

router.delete('/:id', function(req, res, next) {
    req.block.remove()
        .then(function() {
            res.status(204).end();
        })
        .then(null, next);
});

module.exports = router;
