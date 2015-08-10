'use strict';
var socketio = require('socket.io');
var mongoose = require('mongoose');
var io = null;


var sha256 = require('crypto-hashing').sha256;
var blockChain = [];
var lastBlockHash = '';
var txCache = [];
var difficulty = 3;
var reward = 50;
var completedTx = [];

var Tx = mongoose.model('Tx');
var Block = mongoose.model('Block');
var Chain = mongoose.model('Chain');

// get chain info
Chain.findOne().exec().then(function(cha) {
    lastBlockHash = cha.blocks[cha.blocks.length-1];
    blockChain = cha;
});


module.exports = function (server) {

	console.log('started socketio');

    if (io) return io;

    io = socketio(server);

    io.on('connection', function (socket) {
        // Now have access to socket, wowzers!
        console.log('new client connected', socket.id);

        socket.on('newMiner', function() {
            // give new clients latest block chain, tx, and difficulty
            socket.emit('initializeMiner', {
                prevHash: lastBlockHash,
                difficulty: difficulty,
                txCache: txCache,
                reward: reward
            });
        });

        socket.on('changeDifficulty', function(diff) {
            difficulty = diff;
        });

        // should be sent with "completed" block
        socket.on('completedBlock', function(block) {
        	console.log('this socket, ', socket.id, ', thinks it completed a block with this hash: ', block.hash);
            console.log('possibly completed block', block);


        	// validate the new block
            // blocks need to have at least one tx
            if (!block.txs.length) {
                socket.emit('rejectedBlock', 'No tx');
                return;
            }
            // must be latest in the chain
            if (block.prevHash !== lastBlockHash) {
                socket.emit('rejectedBlock', 'Outdated chain');
                return;
            }
            // must have tx that aren't only coinbase
            if (!block.txs.filter(function(tx) {return !tx.coinbase; }).length) {
                socket.emit('rejectedBlock', 'No tx');
                return;
            }

            // check for double spending
            // var start = Date.now();
            // while (Date.now() - start < 3000) {
            //     inputs.forEach(function(input) {
            //         Tx.findOne({
            //             input: {$elemMatch: {address: input.address}}
            //         }).exec().then(function(tx) {
            //             if (tx) return;
            //             console.log('in the validating for each', input.tx);
            //             var t = new Tx(input.tx);
            //             t.save();
            //         });
            //     });
            // }
            ////// either use promise.all
            ////// or look through a cached version of all the tx synchronously

            // ignore the block if it isn't valid
            if (!validateBlock(block)) return;
            console.log('validated the block!');
            // let miner know it was validated
            socket.emit('validatedBlock', block.hash);

            // set all input "coins" as spent
            var inputs = [];
            block.txs.forEach(function(tx) {
                console.log('inside for each,', tx);
                if (!tx.coinbase) {
                    inputs.push({
                        address: tx.input[0].address,
                        amount: tx.input[0].amount,
                        tx: tx.hash
                    });
                }
            });
            // look up that transaction and remove the output to this address with this amount
            inputs.forEach(function(input) {
                Tx.findOne({
                    output: {$elemMatch: {$and: [{address: input.address}, {amount: input.amount}, {spent: false}]}}
                }).exec()
                    .then(function(tx) {
                        console.log('found this tx', tx);
                        // find the correct output
                        tx.output.forEach(function(out) {
                            if (out.address === input.address && out.amount === input.amount) {
                                // set it to spent
                                out.spent = true;
                                console.log('setting this out to spent', out);
                            }
                        });
                        tx.save();
                    });
            });



            // save each tx to the db - and only keep hash in the block tx array
            block.txs = block.txs.map(function(tx) {
                var t = new Tx(tx);
                t.save();
                return t.hash;
            });


            // save the completed blocks to the db
            var b = new Block(block);
            b.save();
            console.log('mongo block', b);


            // add the block to the chain
            console.log('old block chain', blockChain);
            blockChain.blocks.push(b.hash);
            blockChain.save().then(function(cha) {
                console.log('updated block chain', cha);
                blockChain = cha;
            })
            .then(null, function(e) {
                console.warn('got error', e);
            });
            // update cached chain
            lastBlockHash = block.hash;


            // remove the block's txs from the cache
            var completedTxs = block.txs;
            txCache = txCache.filter(function(tx) {
                return completedTxs.indexOf(tx.hash) === -1; 
            });
            // remove old tx's from each miner's tx cache
            io.sockets.emit('updatedTxCache', txCache);


        	// send it out to other miners
            //// just the header? or entire block?
        	io.sockets.emit('newBlock', block.hash);
        });

        // transactions
        socket.on('newTx', function(tx) {
            console.log('got this NEW tx: ', tx);

            // add the tx to the cache
            txCache.push(tx);

            // send tx to miners - don't save to db
            // miners validate the tx
            io.sockets.emit('newTx', tx);
        });

        // for mining button
        socket.on('finishedMining', function() {
            // tell browser mining is over
            socket.emit('finishedMining');
        });

    });

    return io;

};

// stores difficulty in closure
function validHash(hash) {
    for (var i = 0; i < difficulty; i++) {
        if (hash[i] !== '0') return false;
    }
    return true;
}

function validateBlock(block) {
    ///// make the header for hashing
    // start with the previous block hash
    var header = block.prevHash;
    // only use tx hashes - and concat them
    header += block.txs.map(function(tx) {return tx.hash; }).join('');
    // add the timestamp
    header += block.timestamp;

    // add the nonce and hash it (sha256)
    var hash = sha256(header + block.nonce).toString('hex');

    // add nonce and validate the resulting hash
    return validHash(hash);
}