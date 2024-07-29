const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const { User } = require('../models');
const bcrypt = require('bcrypt');

class UserService {
  async registration(email, password) {
    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      throw ApiError.BadRequest(`Пользователь с почтовым адресом  ${email} уже существует`);
    }

    const hashPassword = await bcrypt.hash(password, 3);

    const user = await User.create({ email, password: hashPassword });

    const userDto = new UserDto(user);

    return { user: userDto };
  }
}
