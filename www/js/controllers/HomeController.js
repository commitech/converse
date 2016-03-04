angular.module('converse')
.controller('HomeController',['$scope', '$http', 'DutyService', 'UserService', 'URLS', function($scope, $http, DutyService, UserService, URLS) {
  function refreshDate(date) {
    $scope.date = date;

    var schedulePromise = DutyService.getDutySchedule(
      $scope.date.getDate(),
      $scope.date.getMonth() + 1,
      $scope.date.getFullYear()
    );

    var getDuty = function(dutyId) {
      DutyService.getDuty(dutyId).success(function(result) {
        $scope.duties[dutyId] = result.result;
      });
    }

    var getUser = function(userId) {
      UserService.getUser(userId).success(function(result) {
        $scope.users[userId] = result.result;
      });
    }

    schedulePromise.success(function(result) {
      $scope.duties = {};
      $scope.users = {};
      $scope.dutySchedule = result.result;
      for (var index = 0; index < result.result.length; index++) {
        var schedule = result.result[index];
        if (!(schedule.duty_id in $scope.duties)) {
          getDuty(schedule.duty_id);
        }
        if (!(schedule.supervisor_id in $scope.users)) {
          getUser(schedule.supervisor_id);
        }
      }
    });
  }
  var currentDate = new Date();
  refreshDate(currentDate);

  $scope.nextDay = function() {
    refreshDate(new Date($scope.date.getTime() + (24*60*60*1000)));
  }
  $scope.prevDay = function() {
    refreshDate(new Date($scope.date.getTime() - (24*60*60*1000)));
  }
}]);
