class UserDto {
  constructor(model) {
    this.id = model.id;
    this.email = model.email;
    this.name = model.name;
    this.workInterval = model.workInterval;
    this.breakInterval = model.breakInterval;
    this.intervalsCount = model.intervalsCount;
  }
}

module.exports = UserDto;
