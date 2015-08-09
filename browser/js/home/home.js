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
            },
            users: function($http) {
                return $http.get('/api/users')
                    .then(res => res.data);
            }
        }
    });
});

app.controller('HomeCtrl', function($scope, user, users, txs, BitcoinFactory, TxFactory) {
	if (user) $scope.user = user;
	console.log('logged in', user);
    if (users) $scope.users = users;
    console.log('all users', users);
    if (txs) $scope.txs = txs;
    console.log('txs', txs);

    $scope.sender = user;
    // recipient is their public address
    $scope.recipient = users[0];

    var sCoin = Bitcoin.ECKey.fromWIF($scope.sender.privateKey);

    var pastTxDummy = 'f584d1eb4d7e48b6d870d61c36e6ba9bd6f2a55faf21e0497a19fa7612e8a1ae';

    TxFactory.transaction(pastTxDummy, 0, 15, $scope.recipient);


    // console.log('bitcoin is ', Bitcoin);
    // console.log('private key', user.privateKey);

    // var coin = BitcoinFactory.getCoinFromWIF(user.privateKey);

    // console.log('new coin', coin);
    // console.log('public key', coin.pub);
    // console.log('public addr', coin.pub.getAddress().toString());



});