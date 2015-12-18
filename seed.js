/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');
var User = Promise.promisifyAll(mongoose.model('User'));
var Tx = Promise.promisifyAll(mongoose.model('Tx'));
var Block = Promise.promisifyAll(mongoose.model('Block'));
var Chain = Promise.promisifyAll(mongoose.model('Chain'));

var sha256 = require('crypto-hashing').sha256;

var seedUsers = function () {

    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password'
        },
        {
            email: 'obama@gmail.com',
            password: 'potus'
        },
        {
            email: 'jack@mulrow.com',
            password: 'jack'
        },
        {
            email: 'satoshi.nakamoto@bitcoin.org',
            password: 'satoshi'
        },
        {
            email: 'jack.mulrow@gmail.com',
            password: 'jack'
        }
    ];

    return User.createAsync(users);

};

var seedTx = function(users) {

    var _ = require('lodash');

    function randDigit() {
        return Math.ceil(Math.random() * 10);
    }

    function randString(len) {
        var output = [];
        for (var i = 0; i < len; i++) {
            output.push(randDigit())
        }
        return output.join('');
    }

    // input and output are arrays
    function txHash(tx) {
        tx.pastTxHash = tx.pastTxHash || '';
        // check for coinbase
        if (tx.coinbase) {
            tx.pastTxHash = randString(10);
        }
        // join addresses together in order
        var addresses = tx.input.concat(tx.output);
        addresses = _.pluck(addresses, 'address');
        addresses = addresses.join('') + tx.pastTxHash;
        // return sha256 hash in hexadecimal
        return sha256(addresses).toString('hex');
    }

    var txs = [
        {
            // seed for jack@mulrow
            // special coinbase (free coins after mining a block)
            coinbase: true,
            input: [],
            output: [
                {
                    coinbase: true,
                    address: users[2].publicAddress,
                    amount: 1500,
                    spent: true
                }
            ],
        },
        {
            // coinbase for satoshi
            coinbase: true,
            input: [],
            output: [
                {
                    coinbase: true,
                    address: users[3].publicAddress,
                    amount: 5000,
                    spent: true
                }
            ],
        },
        {
            // coinbase for jack.mulrow@gmail.com
            coinbase: true,
            input: [],
            output: [
                {
                    coinbase: true,
                    address: users[4].publicAddress,
                    amount: 650,
                    spent: true
                }
            ],
        },
        {
            // from jack to obama
            input: [
                {
                    address: users[2].publicAddress,
                    amount: 1500
                }
            ],
            output: [
                {
                    address: users[1].publicAddress,
                    amount: 500
                },
                {
                    address: users[2].publicAddress,
                    amount: 1000,
                    spent: true
                }
            ]
        },
        {
            // jack to testing@fsa
            input: [
                {
                    address: users[2].publicAddress,
                    amount: 1000
                }
            ],
            output: [
                {
                    address: users[0].publicAddress,
                    amount: 400
                },
                {
                    address: users[2].publicAddress,
                    amount: 600
                }
            ]
        }
    ];

    // compute hashes for the transactions

    txs.forEach(function(tx) {
        tx.hash = txHash(tx);
    });

    return Tx.remove().then(function() {
        return Tx.createAsync(txs);
    });
};

var seedBlocksAndChain = function (txs) {

    var nonce = 0;
    function tryHash(header) {
        var counter = 0;
        var hash = '';
        while (!validHash(hash)) {
            hash = sha256(header + nonce).toString('hex');
            counter += 1;
            nonce += 1;
        }
        // prevent one off error with the nonce
        nonce -= 1;

        return hash;
    }

    var difficulty = 2;
    function validHash(hash) {
        for (var i = 0; i < difficulty; i++) {
            if (hash[i] !== '0') return false;
        }
        return true;
    }

    var block = {
        // the genesis block
        prevHash: 'GenesisBlock',
        timestamp: Date.now(),
        nonce: '',
        txs: txs.map(function(tx) {return tx.hash; })
    };

    // create hash for the genesis block
    var header = block.prevHash + block.txs.join('') + block.timestamp;
    block.hash = tryHash(header);
    block.nonce = nonce;

    console.log('the finished block', block);


    // add the block to the chain
    var chain = {
        blocks: [block.hash]
    };

    console.log('the chain', chain);

    return Block.remove().then(function() {
        return Block.createAsync(block);
    }).then(function() {
        return Chain.remove();
    }).then(function() {
        return Chain.createAsync(chain);
    })
    .then(null, function (err) {
        console.error(err);
        process.kill(1);
    });
};

connectToDb.then(function () {
    User.remove().then(function() {
        return seedUsers();
    }).then(function(users) {
        return seedTx(users);
    }).then(function(txs) {
        return seedBlocksAndChain(txs);
    }).then(function() {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    }).then(null, function (err) {
        console.error(err);
        process.kill(1);
    });
});








