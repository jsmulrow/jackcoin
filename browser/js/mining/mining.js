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

    console.log('ran the mining ctrl');

    $scope.startMining = function() {
        $scope.mining = true;
        MiningFactory.beginMining();
    };

    $scope.stopMining = function() {
        $scope.mining = false;
        MiningFactory.stopMining();
    };

});