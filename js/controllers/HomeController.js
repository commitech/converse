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
