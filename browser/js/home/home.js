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

app.controller('HomeCtrl', function($scope, user, users, txs, TxFactory) {
	if (user) {
        user.publicAddress = genPublicAddress(user.privateKey);
        $scope.user = user;
    }
	console.log('logged in', user);
    if (users) $scope.users = users;
    console.log('all users', users);
    if (txs) $scope.txs = txs;
    console.log('txs', txs);

    // creates public address from private key
    function genPublicAddress(priv) {
        return Bitcoin.ECKey.fromWIF(priv).pub.getAddress().toString();
    }
});