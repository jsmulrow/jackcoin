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
            // private key: KxTsiHjy21PdSGCAAgbZwrGo8RW2bcJ7gNAu5nxzEEbJFVUagTRU
            // public addr: 1NXbFiqpVpUhWwbnwJ7m21PpwqF524VK8m
            email: 'testing@fsa.com',
            password: 'password'
        },
        {
            // private key: 141VUn3NQFAV76oVPqDPxbxKHXyazGstob
            // public addr: 1FWCfH41zEQMCUTmrFArtHTfeBbS16aAwQ
            email: 'obama@gmail.com',
            password: 'potus'
        },
        {
            // private key: L4s4f6XCoVvUJ3eXo9xoZpNo4p33JmnyPAbM1qt48XhZPLQTh6sz
            // public addr: 1FWCfH41zEQMCUTmrFArtHTfeBbS16aAwQ
            email: 'jack@mulrow.com',
            password: 'jack'
        },
        {
            // private key: L3oQyPVUxZJQuXnzcMtTjLfWqEGFP7r3VHR2wn4Qf8EFreWfPKzk
            // public addr: 16fFn4hdYx1Kvbqb414P2ZYHr4Tw9npLPb
            email: 'satoshi.nakamoto@bitcoin.org',
            password: 'satoshi'
        },
        {
            // private key: L1Ntz9fEY7Y1f1t2puTviN6UoT7Zfqvbei7SAfBKK4V7D2QYKZ71
            // public addr: 14V9Yed1Br9T5pbwGiGSryEHcvJrNCr8eJ
            email: 'jack.mulrow@gmail.com',
            password: 'jack'
        }
    ];

    return User.createAsync(users);

};

var seedTx = function () {

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
    function txHash(input, output, pastTxHash) {
        pastTxHash = pastTxHash || '';
        // check for coinbase
        if (output[0].coinbase) {
            pastTxHash = randString(10);
        }
        // join addresses together in order
        var addresses = input.concat(output);
        addresses = _.pluck(addresses, 'address');
        addresses = addresses.join('') + pastTxHash;
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
                    address: '1FWCfH41zEQMCUTmrFArtHTfeBbS16aAwQ',
                    amount: 1500,
                    spent: true
                }
            ],
            // hash: 334a15b2a78216e766b11946924b5dd9e3d427ef56a76d9214dbd9559a6683c7
        },
        {
            // from jack to obama
            input: [
                {
                    address: '1FWCfH41zEQMCUTmrFArtHTfeBbS16aAwQ',
                    amount: 1500
                }
            ],
            output: [
                {
                    address: '141VUn3NQFAV76oVPqDPxbxKHXyazGstob',
                    amount: 500
                },
                {
                    address: '1FWCfH41zEQMCUTmrFArtHTfeBbS16aAwQ',
                    amount: 1000,
                    spent: true
                }
            ]
            // hash: 6e8cfff01bf22083495cfe499a1c616a398eec541ea103de0ecebed7a04e5259
        },
        {
            input: [
                {
                    address: '1FWCfH41zEQMCUTmrFArtHTfeBbS16aAwQ',
                    amount: 1000
                }
            ],
            output: [
                {
                    address: '1NXbFiqpVpUhWwbnwJ7m21PpwqF524VK8m',
                    amount: 500
                },
                {
                    address: '1FWCfH41zEQMCUTmrFArtHTfeBbS16aAwQ',
                    amount: 500
                }
            ]
            // hash: b0cc3560ca1dc4aa03cb5dca6df52b532ce2485a1d284838a5b8d80e1878f015
        }
    ];

    // compute hashes for the transactions

    var lastTxHash;
    txs.forEach(function(tx) {
        tx.hash = txHash(tx.input, tx.output);
    });

    return Tx.remove().then(function() {
        return Tx.createAsync(txs);
    });
};

var seedBlocksAndChain = function () {

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
        // hash:
        prevHash: 'GenesisBlock',
        timestamp: Date.now(),
        nonce: '',
        txs: [
            '334a15b2a78216e766b11946924b5dd9e3d427ef56a76d9214dbd9559a6683c7',
            '6e8cfff01bf22083495cfe499a1c616a398eec541ea103de0ecebed7a04e5259',
            'b0cc3560ca1dc4aa03cb5dca6df52b532ce2485a1d284838a5b8d80e1878f015'
        ]
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
    User.findAsync({}).then(function (users) {
        if (users.length === 0) {
            return seedUsers();
        } else {
            console.log(chalk.magenta('Seems to already be user data, exiting!'));
            return;
        }
    }).then(function() {
        return seedTx();
    }).then(function() {
        return seedBlocksAndChain();
    }).then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    }).catch(function (err) {
        console.error(err);
        process.kill(1);
    });
});








