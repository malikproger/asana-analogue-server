class UserDto {
  constructor(model) {
    this.id = model.id;
    this.email = model.email;
    this.name = model.name;
  }
}

module.exports = UserDto;
