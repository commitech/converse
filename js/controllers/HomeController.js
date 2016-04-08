import moment from 'moment';
import _ from 'lodash';
import { formatTimeOfTheDay } from '../utils/moment_utils';

class DutySelection {
  constructor() {
    this._type = 'EMPTY';
    this._selection = new Set();
  }

  isOwnActiveDuty(duty, user) {
    return !duty.isFree && duty.supervisorId === user.id;
  }

  isFreeDuty(duty) {
    return duty.isFree;
  }

  getType(duty, user) {
    if (this.isFreeDuty(duty)) {
      return 'FREE';
    }
    if (this.isOwnActiveDuty(duty, user)) {
      return 'OWN_ACTIVE';
    }
    return 'UNKNOWN';
  }

  canSelect(duty, user) {
    const dutyType = this.getType(duty, user);
    if ((this._type === 'EMPTY' ||
         dutyType === this._type) &&
         dutyType !== 'UNKNOWN') {
      return true;
    }
    return false;
  }

  select(duty, user) {
    if (this.canSelect(duty, user)) {
      this._type = this.getType(duty, user);
      this._selection.add(duty);
    }
  }

  isSelected(duty) {
    return this._selection.has(duty);
  }

  isEmpty() {
    return this._type === 'EMPTY';
  }

  deselect(duty) {
    if (this.isSelected(duty)) {
      this._selection.delete(duty);
      if (this._selection.size === 0) {
        this._type = 'EMPTY';
      }
    }
  }
}

class HomeController {
  constructor($scope, $state, DutyService, UserService, AuthService) {
    this._$scope = $scope;
    this._$state = $state;
    this._DutyService = DutyService;
    this._UserService = UserService;
    this._AuthService = AuthService;
    this.duties = new Map();
    this.schedules = new Map();
    this.users = new Map();
    this.changeDate(moment().hour(0).minute(0).second(0).millisecond(0));
    this.startTimes = [];
    this.clDuties = new Map();
    this.yihDuties = new Map();
    this.selection = new DutySelection();
  }

  getSchedule(duty) {
    return this.schedules.get(duty.scheduleId);
  }

  getSupervisor(duty) {
    return this.users.get(duty.supervisorId);
  }

  getDuty(time, location) {
    const duties = _.map(Array.from(this.duties), (duty) => duty[1]);
    const locationDuties = _.filter(duties, (duty) => {
      return this.getSchedule(duty).location === location;
    });

    const beforeDuties = _.filter(locationDuties, (duty) => {
      return this.getSchedule(duty).startTime.asMilliseconds() <= time.asMilliseconds();
    });

    const currentDuty = _.maxBy(beforeDuties, (duty) => {
      return this.getSchedule(duty).startTime.asMilliseconds();
    });

    return currentDuty;
  }

  formatTime(time) {
    return formatTimeOfTheDay(time);
  }

  getUniqueTimes() {
    const startTimes = _.map(Array.from(this.schedules), (schedule) => schedule[1].startTime);
    const sortedStartTimes = _.sortBy(startTimes, (time) => time.asMilliseconds());
    const uniqueStartTimes = _.sortedUniqBy(sortedStartTimes, (time) => time.asMilliseconds());
    return uniqueStartTimes;
  }

  touchDuty(duty) {
    if (!this.selection.isEmpty()) {
      if (this.selection.isSelected(duty)) {
        this.selection.deselect(duty);
      } else {
        this.selection.select(duty, this.me);
      }
    }
  }

  holdDuty(duty) {
    if (this.selection.isEmpty()) {
      this.selection.select(duty, this.me);
    }
  }

  getColor(duty) {
    if (this.isSelected(duty)) {
      return 'green';
    }
  }

  isSelected(duty) {
    return this.selection.isSelected(duty);
  }

  async refreshData() {
    this.loading = true;
    this._DutyService.clearDuties();
    this._DutyService.clearSchedules();
    this._UserService.clearUsers();
    try {
      const duties = await this._DutyService.fetchDuties({
        date: this.currentDate,
      });
      for (let index = 0; index < duties.length; index++) {
        this.duties.set(duties[index].id, duties[index]);
      }
      this.me = await this._AuthService.me();
      Promise.all(
        duties.map(
          async (duty) => {
            const user = await this._UserService.getUser(duty.supervisorId);
            this.users.set(user.id, user);
            const schedule = await this._DutyService.getSchedule(duty.scheduleId);
            this.schedules.set(schedule.id, schedule);

            if (schedule.location === 'cl') {
              this.clDuties.set(schedule.startTime, duty);
            } else {
              this.yihDuties.set(schedule.startTime, duty);
            }
          }
        )
      ).then(() => {
        const startSet = new Set();
        this.schedules.forEach((value) => {
          startSet.add(value.getStartDateTime(this.currentDate));
        });
        this.loading = false;
        this._$scope.$apply();
      });
    } catch (error) {
      this.error = error;
    }
  }

  async changeDate(date) {
    this.currentDate = date;
    await this.refreshData();
  }
}

HomeController.$inject = ['$scope', '$state', 'DutyService', 'UserService', 'AuthService'];

export { HomeController };

/*angular.module('converse')
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

}]);*/
