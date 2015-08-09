app.factory('MiningFactory', function() {
	var fact = {};

	console.log('ran the mining factory');

	// dependencies 
	var sha256 = cryptoHashing.sha256;	

	// cached data from node
	var txCache = [];
	var difficulty = 2;
	var prevHash = '';

	// should the mining function take the public address of the miner? (logged in user)
	//   or maybe their private key?
	//   i'm using user address to know where the coinbase goes
	fact.beginMining = function(userAddress) {

		// let node know miner is connected
		socket.emit('newMiner');

		console.log('inside mine js');

		// get intial data from node
			// e.g. unconfirmed tx, difficulty level, latest block
		socket.on('initializeMiner', function(data) {
			console.log('received intial data', data);
			txCache = data.txCache;
			difficulty = data.difficulty;
			prevHash = data.prevHash;

			mine();


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

		socket.on('newBlock', function(block) {
			console.log('got this new block', block);

			// update previous hash
			prevHash = block.hash;

			// ditch the previous mining process
			//// does this automatically now
		});

		///// +_+_+_+_+_+_+_+_+_+_+ have periodic checks for new events _=_+F-=_F=_df=_+-+-=-=-=-=_+_+_+_+_+_+_+_
		//// actually I am just only going to have it do it when i tell it to
			/// async is too wierd in js (hamster.io?)
			/// maybe return if there are no tx in the hash
			/// what about when other miners solve hash first?
			///   maybe have server reject the block and then this miner knows to update
		function mine() {

			///// get block info

			// each block has the previous block's hash
				// some transactions
				// and a timestamp

			// create the block
			var block = {
				// last block's hash
				prevHash: prevHash,
				// random tx from the cache
				txs: _.sample(txCache, _.random(1,4)),
				// the current time
				timestamp: Date.now()
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


			// solve for the block's hash
			console.log('starting hashing', difficulty);
			var hash = tryHash(header);
			console.log('ending hashing', hash);


			// add the hash to the block
			block.hash = hash;
			console.log('made this block', block);

			// add the nonce to the block
			//   (nonce is saved with closure for now - lol)
			block.nonce = nonce;
			console.log('this nonce passes', nonce);

			console.log('this header passed', header + nonce);

			// emit the block to the server
			socket.emit('completedBlock', block);
		}

		var nonce = 0;
		function tryHash(header) {
			var counter = 0;
			var hash = '';
			while (!validHash(hash)) {
				hash = sha256(header + nonce).toString('hex');
				counter += 1;
				nonce += 1;
				console.log('the current hash', hash);
			}
			// prevent one off error with the nonce
			nonce -= 1;

			console.log('counter: ', counter);
			return hash;
		}

		function validHash(hash) {
			for (var i = 0; i < difficulty; i++) {
				if (hash[i] !== '0') return false;
			}
			return true;
		}

	};

	fact.stopMining = function() {
		// stop mining
		console.log('stopped mining');
	};

	return fact;
});
	
