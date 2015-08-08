'use strict';
var router = require('express').Router();
var _ = require('lodash');
var mongoose = require('mongoose');
var Chain = mongoose.model('Chain');

router.get('/', function(req, res, next) {
    Chain.findOne(req.query).exec()
        .then(function(chain) {
            res.json(chain);
        })
        .then(null, next);
});

router.post('/', function(req, res, next) {
    
});

module.exports = router;
