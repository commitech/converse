class Duty {
  constructor(scheduleId, date, supervisorId) {
    this.scheduleId = scheduleId;
    this.date = date;
    this.supervisorId = supervisorId;
    this.isFree = false;
  }

  toServerFormat() {
    return {
      duty_id: this.scheduleId,
      day: this.date.date(),
      month: this.date.month(),
      year: this.date.year(),
    };
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
