'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	// each tx has a hash
    hash: {
        type: Object
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
    }
});

mongoose.model('Tx', schema);
