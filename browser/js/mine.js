// console.log('inside mine js');
// // console.log('bitcoin is ', Bitcoin);

// (function() {

// 	var blockchain = {};
// 	var txCache = [];
// 	var difficulty = 2;
// 	// maybe I only need to store the latest block's hash?
// 	var prevHash = '';

// 	var socket = io(window.location.origin);
// 	console.log('connected socketio');

// 	socket.on('connect', function() {
// 		console.log('browser connected to server (i.e. node)');
// 	});

// 	socket.on('initializeMiner', function(prev) {
// 		console.log('received last block from node');
// 		prevHash = prev;
// 	});

// 	socket.on('newDifficulty', function(dif) {
// 		console.log('updating the difficulty');
// 		difficulty = dif;
// 	});

// 	socket.on('newTx', function(tx) {
// 		console.log('got this new tx: - ', tx);

// 		// validate the tx
// 		//// should be given the input, output, and amount - do the hash and see if it passes
// 		//// return if it is not valid --- ie ignore the tx

// 		// add it to the cache
// 		txCache.push(tx);
// 	});

// 	socket.on('newBlock', function(block) {
// 		// update previous hash
// 		prevHash = block.hash;

// 		// ditch the previous mining process

// 	});

// 	var sha256 = require('crypto-hashing').sha256;

// 	console.log('hashed', sha256('jack'));

// 	// blocks

// 	// transactions stored in array sorted by tip (or random)
// 	// each tx has a hash, input, amount, and output
// 	var txs = ['jack', 'bro', 'hey'];

// 	var prevHash = '1234';

// 	var nonce = 0;

// 	// number of consecutive 0s needed at beginning of hash
// 	var difficulty = 1;


// 	///// +_+_+_+_+_+_+_+_+_+_+ have periodic checks for new events _=_+F-=_F=_df=_+-+-=-=-=-=_+_+_+_+_+_+_+_
// 	function mine() {
// 		// select txs
// 		var numTxs = _.random(1, 3);
// 		var mineTxs = _.sample(txs, numTxs);

// 		// only use tx hashes
// 		// mineTxs = mineTxs.map(function(tx) {return tx.hash});

// 		// concat the tx hashes
// 		mineTxs = mineTxs.join('');

// 		console.log(mineTxs);


// 	}

// 	var counter = 0;

// 	function tryHash(header, nonce) {
// 		var hash = '';
// 		while (!validHash(hash, 4)) {
// 			hash = sha256(header + nonce).toString('hex');
// 			counter += 1;
// 			nonce += 1;
// 			console.log('the current hash', hash);
// 		}
// 		return hash;
// 	}

// 	console.log('starting hashing', difficulty);
// 	var h = tryHash('jasdfad8sfas;fa42fdfa', 0);
// 	console.log('counter', counter);
// 	console.log('ending hashing', h);



// 	function validHash(hash, difficulty) {
// 		for (var i = 0; i < difficulty; i++) {
// 			if (hash[i] !== '0') return false;
// 		}
// 		return true;
// 	}


// 	function submitBlock() {

// 		// put the block info in an object


// 		// emit event to server
// 		socket.emit('completedBlock', h);

// 		// server needs blockHeader, selected txs, prev header, and a timestamp (not for validation though)



// 	}





// })();
