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
	if (user) {
        user.publicAddress = genPublicAddress(user.privateKey);
        $scope.user = user;
    }
    $scope.mining = false;
    $scope.initialized = MiningFactory.initialized;
    $scope.message = $scope.initialized ? 'Miner initialized - ready to start' : 'Initialize your miner';
    $scope.diff = MiningFactory.getDifficulty();
    $scope.resultMessage = '';

    $scope.initializeMining = function() {
        MiningFactory.initializeMining();
        $scope.initialized = true;
        $scope.message = 'Miner initialized - ready to start';
    };

    $scope.startMining = function() {
        if ($scope.initialized) {
            $scope.message = 'Currently mining';
            $scope.mining = true;
            MiningFactory.startMining(user.publicAddress);
        }
    };

    $scope.stopMining = function() {
        $scope.mining = false;
        MiningFactory.stopMining();
    };

    $scope.changeDifficulty = function(diff) {
        MiningFactory.changeDifficulty(diff);
    };

    socket.on('finishedMining', function() {
        $scope.$apply(function() {
            $scope.mining = false;
            $scope.message = 'Mining completed';
        });
    });

    socket.on('validatedBlock', function(blockHash) {
        $scope.$apply(function() {
            $scope.resultMessage = 'Completed a validated block - ' + blockHash;
        });
    });

    socket.on('rejectedBlock', function(reason) {
        $scope.$apply(function() {
            $scope.resultMessage = 'Submitted block was rejected - ' + reason;
        });
    });

    // creates public address from private key
    function genPublicAddress(priv) {
        return Bitcoin.ECKey.fromWIF(priv).pub.getAddress().toString();
    }

});