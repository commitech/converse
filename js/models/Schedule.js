class Schedule
{
  constructor(id, day, startTime, endTime, location, supervisorId) {
    this.id = id;
    this.day = day;
    this.startTime = startTime;
    this.endTime = endTime;
    this.location = location;
    this.supervisorId = supervisorId;
  }

  toServerFormat() {
  }

  getStartDateTime(date) {
    return date.clone().add(this.startTime);
  }

  getEndDateTime(date) {
    return date.clone().add(this.endTime);
  }
}

export { Schedule };
