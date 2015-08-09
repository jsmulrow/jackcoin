app.factory('WalletFactory', function($http) {
	var fact = {};

	console.log('ran wallet factory');
	var bitcoin = Bitcoin;

	fact.getRecipients = () => {
		return $http.get('/api/users')
			.then(res => res.data);
	};

	fact.getCoins = (priv) => {
		console.log('this is the private key', priv);
		var pubAddr = bitcoin.ECKey.fromWIF(priv).pub.getAddress().toString();
		console.log('this is the public address', pubAddr);
		return $http.get('/api/tx/coins/' + pubAddr)
			.then(res => res.data);
	};

	fact.getCoinFromWIF = function(wif) {
		return bitcoin.ECKey.fromWIF(wif);
	};

	fact.transaction = function(inputAddr, amount, outputAddr) {
		tx = new bitcoin.Transaction();
		tx.addInput(inputAddr, 0);
		tx.addOutput(outputAddr, amount);
		tx.sign(0, key);
		console.log(tx.toHex());
	};

	return fact;
});