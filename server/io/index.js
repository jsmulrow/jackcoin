'use strict';
var socketio = require('socket.io');
var mongoose = require('mongoose');
var io = null;
var sha256 = require('crypto-hashing').sha256;
var blockChain = [{'test': 'fake block data'}];
var lastBlockHash = 'fakelasthash';
var txCache = [];
var difficulty = 3;
var Tx = mongoose.model('Tx');
var Block = mongoose.model('Block');
var Chain = mongoose.model('Chain');

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
                txCache: txCache
            });
        });

        // should be sent with "completed" block
        socket.on('completedBlock', function(block) {
        	console.log('this socket, ', socket.id, ', thinks it completed a block with this hash: ', block.hash);
            console.log('possibly completed block', block);

        	// validate the new block

            console.log('valid? ', validateBlock(block));

            // ignore the block if it isn't valid
            if (!validateBlock(block)) return;
            console.log('validated the block!');


        	// attach it to the block chain
            /// use a method on the schema?
            /// yeah and just push it to the chain in mongo
            /// probably $push


            // save each tx to the db
            var mongoTxs = [];
            block.txs = block.txs.map(function(tx) {
                var t = new Tx(tx);
                t.spent = true;
                mongoTxs.push(t);
                t.save();
                return t;
            });

            console.log('mongo txs', mongoTxs);

            // save the completed blocks to the db
            var b = new Block(block);
            b.save();
            console.log('mongo block', b);

            // add the block to the chain
            Chain.findOne().exec()
            .then(function(chain) {
                console.log('the chain', chain);
                if (!chain) return;
                chain.push(b);
                chain.save();
                console.log('the new chain', chain);
            })
            .then(null, function(e) {
                console.log('failed ---- ', e);
            });

            console.log('the cache', txCache);


            // remove the block's txs from the cache
            var completedTxs = block.txs.map(function(tx) {
                return tx.hash;
            });
            txCache = txCache.filter(function(tx) {
                return completedTxs.indexOf(tx.hash) === -1; 
            });
            // remove old tx's from each miner's tx cache
            io.sockets.emit('updatedTxCache', txCache);


        	// send it out to other miners
            //// just the header? or entire block?
        	io.sockets.emit('newBlock', block);
        });

        // transactions
        socket.on('newTx', function(tx) {
            console.log('got this NEW tx: ', tx);

            // add the tx to the cache
            txCache.push(tx);

            // send tx to miners - don't save to db
            io.sockets.emit('newTx', tx);
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