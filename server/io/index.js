'use strict';
var socketio = require('socket.io');
var io = null;
var blockChain = {'test': 'fake block data'};
var lastBlockHash = 'fakelasthash';

module.exports = function (server) {

	console.log('started socketio');

    if (io) return io;

    io = socketio(server);

    io.on('connection', function (socket) {
        // Now have access to socket, wowzers!
        console.log('new client connected', socket.id);

        // give new clients latest block chain - and some tx?
        //   maybe just give the lastest chain?
        socket.emit('initializeMiner', lastBlockHash);

        socket.on('completedBlock', function(header) {
        	console.log('this socket, ', socket.id, ', thinks it completed a block with this header: ', header);
        
        	// validate the new block

        	// attach it to the block chain

        	// send it out to other miners
        	socket.broadcast.emit('newBlock', header);
        });

    });
    
    return io;

};
