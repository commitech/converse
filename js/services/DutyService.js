import moment from 'moment';
import { Schedule } from '../models/Schedule.js';
import { Duty, DutyIdentifier } from '../models/Duty.js';
import _ from 'lodash';
class DutyException {
  constructor(message) {
    this.error = message;
  }
}
class DutyService {
  constructor($http, URLS, AuthService) {
    this._$http = $http;
    this._URLS = URLS;
    this._AuthService = AuthService;

    this._schedules = new Map();
    this._duties = new Map();
  }

  async fetchSchedules(params) {
    if (!('day' in params)) {
      throw new DutyException('Parameter day is required.');
    }
    try {
      const todaySchedules = await this._$http({
        method: 'GET',
        url: this._URLS.BASE + '/api/v1/duty/get_original_duty_schedule/',
        withCredentials: true,
        params: {
          day_name: moment.weekdays(params.day.days()),
        },
      });
      return Promise.all(todaySchedules.data.result.map(
        (schedule) => this.fetchSchedule(schedule.duty_id)
      ));
    } catch (error) {
      throw error;
    }
  }

  async fetchSchedule(id) {
    try {
      const response = await this._$http({
        method: 'GET',
        url: this._URLS.BASE + '/api/v1/duty/get_duty/',
        withCredentials: true,
        params: {
          id: id,
        },
      });
      const schedule = new Schedule();
      const scheduleObject = response.data.result;
      schedule.id = scheduleObject.id;

      const dayIndex = moment.weekdays().indexOf(scheduleObject.day_name);
      schedule.day = moment.duration(dayIndex, 'days');
      schedule.startTime = moment.duration(scheduleObject.start_time);
      schedule.endTime = moment.duration(scheduleObject.end_time);
      schedule.location = scheduleObject.location;
      schedule.supervisorId = scheduleObject.supervisor;
      this._schedules.set(schedule.id, schedule);
      return schedule;
    } catch (error) {
      throw error;
    }
  }

  async getSchedule(id) {
    if (this._schedules.has(id)) {
      return this._schedules.get(id);
    }
    return this.fetchSchedule(id);
  }

  async getDuty(dutyIdentifier) {
    if (this._duties.has(dutyIdentifier)) {
      return this._duties.get(dutyIdentifier);
    }
    return this.fetchDuties({
      date: dutyIdentifier.date,
    });
  }

  async fetchDuties(params) {
    if (!('date' in params)) {
      throw new DutyException('Parameter date is required.');
    }
    try {
      const response = await this._$http({
        method: 'GET',
        url: this._URLS.BASE + '/api/v1/duty/get_duty_schedule/',
        withCredentials: true,
        params: {
          day: params.date.date(),
          month: params.date.month(),
          year: params.date.year(),
        },
      });
      return response.data.result.map((dutyObject) => {
        const duty = new Duty();
        duty.date = params.date;
        duty.isFree = dutyObject.is_free;
        duty.scheduleId = dutyObject.duty_id;
        duty.supervisorId = dutyObject.supervisor_id;
        this._duties.set(new DutyIdentifier(duty.scheduleId, duty.date), duty);
        return duty;
      });
    } catch (error) {
      throw error;
    }
  }
  clearDuties() {
    this._duties.clear();
  }
  clearSchedules() {
    this._schedules.clear();
  }

  async releaseDuties(duties) {
    try {
      const user = await this._AuthService.me();
      const response = await this._$http({
        method: 'GET',
        url: this._URLS.BASE + '/api/v1/duty/release_duties/',
        withCredentials: true,
        params: {
          user: user.toServerFormat(),
          specific_duties: JSON.stringify(_.map(duties, (duty) => duty.toServerFormat())),
        },
      });
      _.map(duties, (duty) => {
        duty.isFree = true;
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async grabDuties(duties) {
    try {
      const user = await this._AuthService.me();
      const response = await this._$http({
        method: 'GET',
        url: this._URLS.BASE + '/api/v1/duty/grab_duties/',
        withCredentials: true,
        params: {
          user: user.toServerFormat(),
          specific_duties: JSON.stringify(_.map(duties, (duty) => duty.toServerFormat())),
        },
      });
      _.map(duties, (duty) => {
        duty.isFree = true;
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const service = ($http, URLS, AuthService) => new DutyService($http, URLS, AuthService);
service.$inject = ['$http', 'URLS', 'AuthService'];

export { service as DutyService };
