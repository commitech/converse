class User {

  constructor() {
    this.id = null;
    this.name = null;
    this.matricNumber = null;
    this.contact = null;
    this.email = null;
    this.cell = null;
    this.position = null;
    this.isNotification = null;
    this.status = null;
    this.isAdmin = null;
    this.tracking = null;
    this.isDuty = null;
  }

  toServerFormat() {
    return {
      id: this.id,
      name: this.name,
      matric_number: this.matricNumber,
      contact: this.contact,
      email: this.email,
      cell: this.cell,
      position: this.position,
      is_notification: this.isNotification,
      status: this.status,
      is_admin: this.isAdmin,
      tracking: this.tracking,
      is_duty: this.isDuty,
    };
  }
}

User.fromJSONObject = (obj) => {
  const user = new User();
  user.id = obj.id;
  user.name = obj.name;
  user.matricNumber = obj.matric_number;
  user.contact = obj.contact;
  user.email = obj.email;
  user.position = obj.position;
  user.isNotification = obj.is_notification;
  user.status = obj.status;
  user.isAdmin = obj.is_admin;
  user.tracking = obj.tracking;
  user.isDuty = obj.is_duty;
  return user;
};

export { User };
