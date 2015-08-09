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


// // i will calculate tx hashes by concating input and output addresses (in order)

// var tx =  {
//         input: [
//             {
//                 address: '12345',
//                 amount: 50
//             }
//         ],
//         output: [
//             {
//                 address: '55555',
//                 amount: 35
//             },
//             {
//                 address: '12345',
//                 amount: 15
//             }
//         ]
//     };
// var _ = require('lodash');
// var sha256 = require('crypto-hashing').sha256;

// // input and output are arrays
// function txHash(input, output) {
//     // join addresses together in order
//     var addresses = input.concat(output);
//     addresses = _.pluck(addresses, 'address');
//     addresses = addresses.join('');
//     // return sha256 hash in hexadecimal
//     return sha256(addresses).toString('hex');
// }

// console.log(txHash(tx.input, tx.output));






