app.factory('BitcoinFactory', function() {
	var fact = {};

	console.log('ran bitcoin factory');
	var bitcoin = Bitcoin;

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