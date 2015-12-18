app.config(function ($stateProvider) {

    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: 'js/login/signup/signup.html',
        controller: 'SignupCtrl'
    });

});

app.controller('SignupCtrl', function ($scope, AuthService, $state) {

    $scope.signup = {};
    $scope.error = null;

    $scope.sendLogin = function (signupInfo) {

        $scope.error = null;

        AuthService.signup(signupInfo).then(function (user) {
            console.log(user);
            $state.go('chain');
        }).catch(function () {
            $scope.error = 'Invalid signup credentials.';
        });

    };

});