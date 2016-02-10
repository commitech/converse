angular.module('converse')
.controller('LoginController', ['$scope', '$http', function($scope, $http) {
  $scope.loginResponse = "";
  $scope.loginError = "";
  $scope.meResponse = "";
  $scope.meError = "";
  $scope.login = function() {
    $http({
      method: 'POST',
      url: 'http://nathanajah.me:3000/api/v1/user/login/?username=admin&password=password',
      withCredentials: true
    }).then(function success(response) {
      $scope.loginResponse = response.data;
    }, function error(error) {
      $scope.loginError = error;
    });
  };
  $scope.me = function() {
    $http({
      method: 'GET',
      url: 'http://nathanajah.me:3000/api/v1/user/me',
      withCredentials: true
    }).then(function success(response) {
      $scope.meResponse = response.data;
    }, function error(error) {
      $scope.meError = error;
    });
  }

}]);
