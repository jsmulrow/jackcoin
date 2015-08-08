app.config(function ($stateProvider) {
    $stateProvider.state('chain', {
        url: '/chain',
        templateUrl: 'js/chain/chain.html',
        controller: 'ChainCtrl',
        resolve: {
        	user: function(AuthService) {
        		return AuthService.getLoggedInUser();
        	}
        }
    });
});

app.controller('ChainCtrl', function($scope, user, BitcoinFactory) {
	if (user) $scope.user = user;

	console.log('welcome to the JackChain, ', user.email);

});