app.config(function ($stateProvider) {

    $stateProvider.state('register', {
        url: '/register',
        templateUrl: 'js/register/register.html',
        controller: 'RegisterCtrl'
    });

});

app.controller('RegisterCtrl', function ($scope, AuthService, $state) {

    $scope.register = {};
    $scope.error = null;

    $scope.sendLogin = function (registerInfo) {

        $scope.error = null;

        AuthService.register(registerInfo).then(function (user) {
            $state.go('chain');
        }).catch(function () {
            $scope.error = 'Invalid register credentials.';
        });

    };

});