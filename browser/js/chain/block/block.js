app.config(function ($stateProvider) {
    $stateProvider.state('chain.block', {
        url: '/block/:hash',
        templateUrl: 'js/chain/block/block.html',
        controller: 'BlockCtrl',
        resolve: {
            block: function($http, $stateParams) {
                return $http.get('/api/blocks/hash/' + $stateParams.hash)
                    .then(res => res.data);
            }
        }
    });
});

app.controller('BlockCtrl', function($scope, block) {
    if (block) $scope.block = block;

});