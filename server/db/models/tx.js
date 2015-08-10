'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	// each tx has a hash
    coinbase: {
        type: Boolean,
        default: false
    },
    hash: {
        type: String
    },
    // input 
    input: {
    	type: [{
            address: {
                type: String
            },
            amount: Number
        }]
    },
    output: {
    	type: [{
            address: {
                type: String
            },
            amount: Number,
            spent: {
                type: Boolean,
                default: false
            }
        }]
    },
    timestamp: Date
});

mongoose.model('Tx', schema);
