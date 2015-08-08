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
    	type: [String]
    },
    output: {
    	type: [String]
    }
});

mongoose.model('Tx', schema);