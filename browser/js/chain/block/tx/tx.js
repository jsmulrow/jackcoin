app.config(function ($stateProvider) {
    $stateProvider.state('chain.block.tx', {
        url: '/tx/:txHash',
        templateUrl: 'js/chain/block/tx/tx.html',
        controller: 'TxCtrl',
        resolve: {
            tx: function($http, $stateParams) {
                return $http.get('/api/tx/hash/' + $stateParams.txHash)
                    .then(res => res.data);
            }
        }
    });
});

app.controller('TxCtrl', function($scope, tx) {
    if (tx) $scope.tx = tx;

});