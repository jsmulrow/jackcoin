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
    txs: {
    	type: mongoose.Schema.Types.ObjectId,
    	ref: 'Tx'
    }
});

mongoose.model('Block', schema);