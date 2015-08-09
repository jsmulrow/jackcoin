app.config(function ($stateProvider) {
    $stateProvider.state('mining', {
        url: '/mining',
        templateUrl: 'js/mining/mining.html',
        controller: 'MiningCtrl',
        resolve: {
        	user: function(AuthService) {
        		return AuthService.getLoggedInUser();
        	}
        }
    });
});

app.controller('MiningCtrl', function($scope, user, MiningFactory) {
	if (user) $scope.user = user;
	console.log('logged in', user);
    $scope.mining = false;
    $scope.initialized = false;

    console.log('ran the mining ctrl');

    $scope.initializeMining = function() {
        MiningFactory.initializeMining();
        $scope.initialized = true;
    };

    $scope.startMining = function() {
        MiningFactory.startMining();
        if ($scope.initialized) {
            $scope.mining = true;
        }
    };

    $scope.stopMining = function() {
        $scope.mining = false;
        MiningFactory.stopMining();
    };

});