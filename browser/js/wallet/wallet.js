app.config(function ($stateProvider) {
    $stateProvider.state('wallet', {
        url: '/wallet',
        templateUrl: 'js/wallet/wallet.html',
        controller: 'HomeCtrl',
        resolve: {
        	user: function(AuthService) {
        		return AuthService.getLoggedInUser();
        	}
        }
    });
});

app.controller('HomeCtrl', function($scope, user, BitcoinFactory) {
	if (user) $scope.user = user;
	console.log('logged in', user);

    console.log('bitcoin is ', Bitcoin);
    console.log('private key', user.privateKey);

    var coin = BitcoinFactory.getCoinFromWIF(user.privateKey);

    console.log('new coin', coin);
    console.log('public key', coin.pub);
    console.log('public addr', coin.pub.getAddress().toString());



});