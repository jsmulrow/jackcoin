app.factory('TxFactory', function($http, AuthService) {
	var fact = {};

	console.log('ran tx factory');

    var sha256 = cryptoHashing.sha256;

    // get user - for convenience
	var user;
	AuthService.getLoggedInUser()
	.then(function(us) {
		user = us;
		console.log('tx factory has this user', user);
	});

	// input and output are arrays
    function txHash(input, output, timestamp) {
        // join addresses together in order
        var addresses = input.concat(output);
        addresses = _.pluck(addresses, 'address');
        addresses = addresses.join('') + timestamp;
        // return sha256 hash in hexadecimal
        return sha256(addresses).toString('hex');
    }

	fact.getCoinFromWIF = function(wif) {
		return Bitcoin.ECKey.fromWIF(wif);
	};

	fact.transaction = function(inputHash, idx, newAmount, outputAddr) {
		// initialize new tx
		var newTx = {hash: '', input: [], output: []};
		var oldAddr = '';
		var oldAmount = 0;

		// find the referenced transaction
		// input hash is the hash for a previous transaction		
		return $http.get('/api/tx/hash/' + inputHash)
		.then(res => res.data)
		.then(tx => {
			console.log('got past tx', tx);
			// extract amount at the given index

			// update vars for convenience
			oldAddr = tx.output[idx].address;
			oldAmount = tx.output[idx].amount;

			// logs for testing
			console.log('sender\'s address: ', oldAddr);
			console.log('sender has this many coins: ', oldAmount);

			// confirm sender has enough coins
			if (newAmount > oldAmount) throw new Error('not enough coins');

			// update new tx with sender's info
			newTx.input.push({
				// address is the given index in the old output
				address: oldAddr,
				amount: oldAmount
			});

			// send money to recipient
			newTx.output.push({
				address: outputAddr,
				amount: newAmount
			});

			// return change to sender
			newTx.output.push({
				address: oldAddr,
				amount: oldAmount - newAmount
			});

			// attach timestamp to tx
			newTx.timestamp = Date.now();

			// hash the tx
			newTx.hash = txHash(newTx.input, newTx.output, newTx.timestamp);

			// sign the tx
			var coin = Bitcoin.ECKey.fromWIF(user.privateKey);
			console.log('user\'s coin, ', coin);

			// attach the signature and public key to the tx
			newTx.validation = {
				signature: '',
				publicKey: ''
			};
  
			console.log('new tx before being sent', newTx);

			// send tx to server with websocket to be broadcast
			/// tx is NOT being saved yet - must be verified by miners
			socket.emit('newTx', newTx);

			console.log('submitted the transaction');

			return;
		})
		.catch(e => {
			if (e.message === 'not enough coins') {
				console.log('failed tx - not enough coins');
			} else {
				// something else
				console.error(e);
			}
		});
	};

	return fact;
});