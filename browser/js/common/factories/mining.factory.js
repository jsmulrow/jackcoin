app.factory('MiningFactory', function(AuthService) {
	var fact = {};

	// dependencies 
	var sha256 = cryptoHashing.sha256;

	// cached data from node
	var txCache = [];
	var difficulty = 3;
	var reward = 50;
	var prevHash = '';
	// min number of tx to start mining automatically
	// var cacheMin = Math.ceil(Math.random() * 4);
	var cacheMin = 2;

	// get user - for convenience
	var user;
	AuthService.getLoggedInUser()
	.then(function(us) {
		user = us;
		console.log('mining factory has this user', user);
	});

	var initialized = false;
	fact.initialized = initialized;

	fact.changeDifficulty = function(diff) {
		difficulty = diff;
		socket.emit('changeDifficulty', diff);
        console.log('difficulty: ', diff);
	};

	fact.getDifficulty = function() {
		return difficulty;
	};

	fact.startMining = function(publicAddress, auto) {
		if (initialized) {

			var sampleNum = auto ? cacheMin : _.random(1,4);

			// create the block
			var block = {
				// last block's hash
				prevHash: prevHash,
				// random tx from the cache
				txs: _.sample(txCache, sampleNum),
				// the current time
				timestamp: Date.now(),
			};

			var coinbase = {
				coinbase: true,
				hash: '',
				input: [],
				output: [{
					address: publicAddress,
					amount: reward
				}],
				timestamp: Date.now()
			};

			function txHash(input, output, timestamp) {
		        // join addresses together in order
		        var addresses = input.concat(output);
		        addresses = _.pluck(addresses, 'address');
		        addresses = addresses.join('') + timestamp;
		        // return sha256 hash in hexadecimal
		        return sha256(addresses).toString('hex');
		    }

			coinbase.hash = txHash(coinbase.input, coinbase.output, coinbase.timestamp);

			// add the coinbase (reward) to the block
			block.txs.push(coinbase);

			///// make the header for hashing
			// start with the previous block hash
			var header = block.prevHash;
			// only use tx hashes - and concat them
			header += block.txs.map(tx => tx.hash).join('');
			// add the timestamp
			header += block.timestamp;

			// start a web worker
			var miner = new Worker('mine.js');
			// pass the initial header in to the worker
			miner.postMessage([header, difficulty]);
			// have it return the valid nonce
			miner.addEventListener('message', function(e) {

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
				socket.emit('completedBlock', block);
				socket.emit('finishedMining');
			});
		} else {
			alert('Initialize your miner first');
		}
	};

	// should the mining function take the public address of the miner? (logged in user)
	//   or maybe their private key?
	//   i'm using user address to know where the coinbase goes
	fact.initializeMining = function() {
		// short-circuit if already run
		if (initialized) return;

		initialized = true;
		fact.initialized = true;

		// sets up socket connection

		// let node know miner is connected
		socket.emit('newMiner');

		// get intial data from node
			// e.g. unconfirmed tx, difficulty level, latest block
		socket.on('initializeMiner', function(data) {
			// validate the given tx
			txCache = data.txCache.filter(tx => {
				return validTx(tx);
			});
			difficulty = data.difficulty;
			prevHash = data.prevHash;
			reward = data.reward;
		});

		socket.on('updatedTxCache', function(cache) {
			txCache = cache;
		});

		socket.on('newDifficulty', function(dif) {
			difficulty = dif;
		});

		socket.on('newTx', function(tx) {

			// validate the tx
			//// should be given the input, output, and amount - do the hash and see if it passes
			//// return if it is not valid --- ie ignore the tx

			// add it to the cache
			txCache.push(tx);

			if (txCache.length >= cacheMin) {
				// start mining the block
				fact.startMining('', true);
			}
		});

		socket.on('newBlock', function(hash) {
			console.log('got this new block hash', hash);
			// update previous hash
			prevHash = hash;
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

	function validTx(tx) {
		return true;
	}

	return fact;
});
	
