app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl',
        resolve: {
        	user: function(AuthService) {
        		return AuthService.getLoggedInUser();
        	},
            txs: function($http) {
                return $http.get('/api/tx')
                    .then(res => res.data);
            }
        }
    });
});

app.controller('HomeCtrl', function($scope, user, txs, BitcoinFactory) {
	if (user) $scope.user = user;
	console.log('logged in', user);
    console.log('txs', txs);
    if (txs) $scope.txs = txs;

    console.log('dafasdf-a0=-=-=-=--==-');

    // console.log('bitcoin is ', Bitcoin);
    // console.log('private key', user.privateKey);

    // var coin = BitcoinFactory.getCoinFromWIF(user.privateKey);

    // console.log('new coin', coin);
    // console.log('public key', coin.pub);
    // console.log('public addr', coin.pub.getAddress().toString());



});