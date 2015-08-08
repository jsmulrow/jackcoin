'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    // the whole chain will just be a collection of blocks
    chain: {
        type: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Block'
		}]
    }
});

mongoose.model('Chain', schema);