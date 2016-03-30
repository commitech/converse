angular.module('converse')
.controller('HomeController',['$scope', '$http', '$state', '$q', 'DutyService', 'UserService', 'URLS', function($scope, $http, $state, $q, DutyService, UserService, URLS) {
  function redirectToLogin() {
    $state.go('login');
  }

  $scope.me = {};
  $scope.loading = false;
  UserService.getMe()
    .success(function(result) {
    $scope.me = result.result;
  });

  function refreshDate(date) {
    var promises = [];
    $scope.loading = true;

    $scope.date = date;
    $scope.startTimes = {};
    $scope.dutyIdToSchedule = {};
    $scope.selection = new Set();
    var schedulePromise = DutyService.getDutySchedule(
      $scope.date.getDate(),
      $scope.date.getMonth() + 1,
      $scope.date.getFullYear()
    );

    promises.push(schedulePromise);

    var getDuty = function(dutyId) {
      var promise = DutyService.getDuty(dutyId);
      promises.push(promise);
      promise
        .success(function(result) {
          $scope.duties[dutyId] = result.result;
          if (!$scope.startTimes[result.result.start_time]) {
            $scope.startTimes[result.result.start_time] = {};
          }
          $scope.startTimes[result.result.start_time][result.result.location] = result.result;
        })
        .error(redirectToLogin);
    }

    var getUser = function(userId) {
      var promise = UserService.getUser(userId)
      promises.push(promise);
      promise
        .success(function(result) {
          $scope.users[userId] = result.result;
        })
        .error(redirectToLogin);
    }

    schedulePromise.success(function(result) {
      $scope.duties = {};
      $scope.users = {};
      $scope.dutySchedule = result.result;
      for (var index = 0; index < result.result.length; index++) {
        var schedule = result.result[index];
        $scope.dutyIdToSchedule[schedule.duty_id] = schedule;
        if (!(schedule.duty_id in $scope.duties)) {
          getDuty(schedule.duty_id);
        }
        if (!(schedule.supervisor_id in $scope.users)) {
          getUser(schedule.supervisor_id);
        }
      }
    }).error(redirectToLogin);

    $q.all(promises).then(
      function() {
        $scope.loading = false;
      },
      function() {
        $scope.loading = false;
      }
    );
  }

  $scope.$on('$ionicView.enter', function() {
    var currentDate = new Date();
    refreshDate(currentDate);
  });

  $scope.nextDay = function() {
    refreshDate(new Date($scope.date.getTime() + (24*60*60*1000)));
  }
  $scope.prevDay = function() {
    refreshDate(new Date($scope.date.getTime() - (24*60*60*1000)));
  }

  function isOwnActiveDuty(duty) {
    var schedule = $scope.dutyIdToSchedule[duty.id];
    return !schedule.is_free && schedule.supervisor_id == $scope.me.id;
  }

  function isFreeDuty(duty) {
    var schedule = $scope.dutyIdToSchedule[duty.id];
    return schedule.is_free;
  }

  $scope.getColor = function(duty) {
    if ($scope.selection.has(duty.id)) {
      return "green";
    } else if (isFreeDuty(duty)) {
      return "blue";
    } else {
      return "white";
    }
  }

  $scope.selection = new Set();
  $scope.holdDuty = function(duty) {
    if ($scope.selection.size == 0) {
      if (isOwnActiveDuty(duty) || isFreeDuty(duty)) {
        $scope.selection.add(duty.id);
      }
    }
  }

  $scope.touchDuty = function(duty) {
    if ($scope.selection.size > 0) {
      if ($scope.selection.has(duty.id)) {
        $scope.selection.delete(duty.id);
      } else {
        var firstElement = $scope.selection.values().next().value;
        if (isOwnActiveDuty($scope.duties[firstElement]) && isOwnActiveDuty(duty)) {
          $scope.selection.add(duty.id);
        } else if (isFreeDuty($scope.duties[firstElement]) && isFreeDuty(duty)){
          $scope.selection.add(duty.id);
        }
      }
    }
  }

  $scope.dropSelection = function() {
    if ($scope.selection.size > 0) {
      var firstElement = $scope.selection.values().next().value;
      if (isOwnActiveDuty($scope.duties[firstElement])) {
      }
    }
  }

}]);
