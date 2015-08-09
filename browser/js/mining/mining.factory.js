app.factory('MiningFactory', function() {
	var fact = {};

	console.log('ran the mining factory');

	// dependencies 
	var sha256 = cryptoHashing.sha256;	

	// cached data from node
	var txCache = [];
	var difficulty = 2;
	var prevHash = '';

	var initialized = false;

	fact.startMining = function() {
		if (initialized) {
			socket.emit('newMiner');

			// create the block
			var block = {
				// last block's hash
				prevHash: prevHash,
				// random tx from the cache
				txs: _.sample(txCache, _.random(1,4)),
				// the current time
				timestamp: Date.now(),
			};

			///// make the header for hashing
			// start with the previous block hash
			var header = block.prevHash;
			// only use tx hashes - and concat them
			header += block.txs.map(tx => tx.hash).join('');
			// add the timestamp
			header += block.timestamp;

			console.log('this is the header', header);
			console.log('these are the tx', block.txs);

			// start a web worker
			var miner = new Worker('mine.js');
			// pass the initial header in to the worker
			miner.postMessage([header, difficulty]);
			// have it return the valid nonce
			miner.addEventListener('message', function(e) {
				console.log('from miner Web Worker', e.data);

				// close the miner
				miner.terminate();

				// the worker returns a valid nonce
				var nonce = e.data.nonce;

				// confirm the nonce / recalculate for block hash property
				var hash = sha256(header + nonce).toString('hex');
				if (!validHash(hash, difficulty)) {
					console.error(new Error('miner returned invalid nonce'));
					return;
				}

				// add the hash and nonce to the block
				block.hash = hash;
				block.nonce = nonce;

				// send the completed block to the node (i.e. server)
				console.log('made this block, emitting now', block);
				socket.emit('completedBlock', block);
			});
		} else {
			alert('Initialize your miner first');
		}
	};

	// should the mining function take the public address of the miner? (logged in user)
	//   or maybe their private key?
	//   i'm using user address to know where the coinbase goes
	fact.initializeMining = function(userAddress) {
		// sets up socket connection

		// let node know miner is connected
		console.log('emitting new miner event');
		socket.emit('newMiner');

		console.log('inside mine js');

		// get intial data from node
			// e.g. unconfirmed tx, difficulty level, latest block
		socket.on('initializeMiner', function(data) {
			console.log('received intial data', data);
			txCache = data.txCache;
			difficulty = data.difficulty;
			prevHash = data.prevHash;
			initialized = true;
		});

		socket.on('updatedTxCache', function(cache) {
			console.log('updating the cache', cache);
			txCache = cache;
		});

		socket.on('newDifficulty', function(dif) {
			console.log('updating the difficulty');
			difficulty = dif;
		});

		socket.on('newTx', function(tx) {
			console.log('got this new tx: - ', tx);
			console.log('random number: ', Math.ceil(Math.random() * 5));

			// validate the tx
			//// should be given the input, output, and amount - do the hash and see if it passes
			//// return if it is not valid --- ie ignore the tx



			// add it to the cache
			txCache.push(tx);
		});

		socket.on('newBlock', function(hash) {
			console.log('got this new block hash', hash);

			// update previous hash
			prevHash = hash;

			// ditch the previous mining process
			//// does this automatically now
		});

	};

	fact.stopMining = function() {
		// stop mining
		console.log('stopped mining');
	};

	function validHash(hash, difficulty) {
		for (var i = 0; i < difficulty; i++) {
			if (hash[i] !== '0') return false;
		}
		return true;
	}

	return fact;
});
	
