'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    hash: {
        type: String
    },
    prevHash: {
    	type: String
    },
    txs: [String],
        // hash of a tx
    timestamp: {
        type: Date
    },
    nonce: {
        type: Number
    }
});

mongoose.model('Block', schema);