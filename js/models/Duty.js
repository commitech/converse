class Duty {
  constructor(scheduleId, date, supervisorId) {
    this.scheduleId = scheduleId;
    this.date = date;
    this.supervisorId = supervisorId;
    this.isFree = false;
  }

  isOwnedBy(supervisorId) {
    return !this.isFree && this.supervisorId === supervisorId;
  }

  canBeGrabbed() {
    return this.isFree;
  }

  get id() {
    return '' + this.scheduleId + '_' + this.date.format('YYYY-MM-DD');
  }
}

class DutyIdentifier {
  constructor(scheduleId, date) {
    this.scheduleId = scheduleId;
    this.date = date;
  }
}
export { Duty, DutyIdentifier };
