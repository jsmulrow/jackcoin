app.config(function ($stateProvider) {
    $stateProvider.state('chain.block', {
        url: '/block/:hash',
        templateUrl: 'js/chain/block/block.html',
        controller: 'BlockCtrl',
        resolve: {
        	user: function(AuthService) {
        		return AuthService.getLoggedInUser();
        	},
            block: function($http, $stateParams) {
                return $http.get('/api/blocks/hash/' + $stateParams.hash)
                    .then(res => res.data);
            }
        }
    });
});

app.controller('BlockCtrl', function($scope, user, block, BitcoinFactory) {
	if (user) $scope.user = user;
    if (block) $scope.block = block;

	console.log('welcome to the JackChain, ', user.email);

});