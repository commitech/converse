angular.module('converse')
.controller('LoginController', ['$scope', '$http', 'login', 'URLS', function($scope, $http, login, URLS) {
  $scope.loginResponse = "";
  $scope.loginError = "";
  $scope.meResponse = "";
  $scope.meError = "";
  $scope.credentials = {
    "username": "",
    "password": ""
  };
  $scope.login = function() {
    login($scope.credentials.username, $scope.credentials.password)
    .then(function(response) {
      $scope.loginResponse = response;
    }, function(e) {
      $scope.loginError = e;
    });
  };
  $scope.me = function() {
    $http({
      method: 'GET',
      url: URLS.BASE + '/api/v1/user/me',
      withCredentials: true
    }).then(function success(response) {
      $scope.meResponse = response.data;
    }, function error(error) {
      $scope.meError = error;
    });
  }

}]);
