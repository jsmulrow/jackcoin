app.config(function ($stateProvider) {
    $stateProvider.state('chain', {
        url: '/',
        templateUrl: 'js/chain/chain.html',
        controller: 'ChainCtrl',
        resolve: {
        	user: function(AuthService) {
        		return AuthService.getLoggedInUser();
        	},
            chain: function($http) {
                return $http.get('/api/chain')
                    .then(res => res.data);
            }
        }
    });
});

app.controller('ChainCtrl', function($scope, user, chain) {
	if (user) {
        user.publicAddress = genPublicAddress(user.privateKey);
        $scope.user = user;
    }
    if (chain) $scope.chain = chain;

    // creates public address from private key
    function genPublicAddress(priv) {
        return Bitcoin.ECKey.fromWIF(priv).pub.getAddress().toString();
    }

});