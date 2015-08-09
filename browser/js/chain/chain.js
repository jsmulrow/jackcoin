app.config(function ($stateProvider) {
    $stateProvider.state('chain', {
        url: '/chain',
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

app.controller('ChainCtrl', function($scope, user, chain, BitcoinFactory) {
	if (user) $scope.user = user;
    if (chain) $scope.chain = chain;

	console.log('welcome to the JackChain, ', user.email);

});