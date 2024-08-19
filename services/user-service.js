const { User } = require('../models');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const axios = require('axios');

class UserService {
  async registration(email, password, deviceId) {
    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
    }

    const hashPassword = await bcrypt.hash(password, 3);

    const user = await User.create({ email, password: hashPassword });

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto, deviceId });

    await tokenService.saveToken(userDto.id, tokens.refreshToken, deviceId);

    return { ...tokens, user: userDto };
  }

  async login(email, password, deviceId) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw ApiError.BadRequest('Неверные имя пользователя или пароль');
    }

    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Неверные имя пользователя или пароль');
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto, deviceId });

    await tokenService.saveToken(userDto.id, tokens.refreshToken, deviceId);

    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const { deviceId, ...userData } = await tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await User.findByPk(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto, deviceId });

    await tokenService.saveToken(userDto.id, tokens.refreshToken, deviceId);

    return { ...tokens, user: userDto };
  }

  async loginVK(code, state, deviceId) {
    if (!code || !state || !deviceId) {
      throw ApiError.UnauthorizedError();
    }

    const {
      data: { refresh_token: refreshToken, access_token: accessToken, user_id: vkUserId },
    } = await axios.post(
      'https://id.vk.com/oauth2/auth',
      {
        client_id: process.env.VK_CLIENT_ID,
        client_secret: process.env.VK_CLIENT_SECRET,
        redirect_uri: process.env.CLIENT_URL,
        code: code,
        code_verifier: 'FGH767Gd65',
        grant_type: 'authorization_code',
        device_id: deviceId,
        state: state,
      },
      {
        params: {
          client_id: process.env.VK_CLIENT_ID,
          client_secret: process.env.VK_CLIENT_SECRET,
          redirect_uri: process.env.CLIENT_URL,
          code: code,
          code_verifier: 'FGH767Gd65',
          grant_type: 'authorization_code',
          device_id: deviceId,
          state: state,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const {
      data: {
        user: { first_name: firstName, last_name: lastName, email, avatar, birthday },
      },
    } = await axios.post(
      'https://id.vk.com/oauth2/user_info',
      {
        client_id: process.env.VK_CLIENT_ID,
        client_secret: process.env.VK_CLIENT_SECRET,
        access_token: accessToken,
      },
      {
        params: {
          client_id: process.env.VK_CLIENT_ID,
          client_secret: process.env.VK_CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const [user, isCreated] = await User.findOrCreate({
      where: { email },
      defaults: {
        email,
        vkUserId,
        firstName,
        lastName,
        avatar,
        birthday,
        isActivated: true,
      },
    });

    if (!isCreated) {
      user.vkUserId = vkUserId;
      user.firstName = firstName;
      user.lastName = lastName;
      user.avatar = avatar;
      user.birthday = birthday;
      user.isActivated = true;

      await user.save();
    }

    const userDto = new UserDto(user);

    const tokens = { accessToken, refreshToken };
    await tokenService.saveToken(userDto.id, refreshToken, deviceId);

    return { ...tokens, user: userDto };
  }

  async refreshVK(refreshToken, deviceId) {
    if (!refreshToken || !deviceId) {
      throw ApiError.UnauthorizedError();
    }

    const {
      data: { refresh_token: newRefreshToken, access_token: newAccessToken, user_id: vkUserId },
    } = await axios.post(
      'https://id.vk.com/oauth2/auth',
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.VK_CLIENT_ID,
        client_secret: process.env.VK_CLIENT_SECRET,
        device_id: deviceId,
      },
      {
        params: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.VK_CLIENT_ID,
          client_secret: process.env.VK_CLIENT_SECRET,
          device_id: deviceId,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (!vkUserId) {
      throw ApiError.UnauthorizedError();
    }

    const user = await User.findOne({ where: { vkUserId } });
    const userDto = new UserDto(user);
    const tokens = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };

    await tokenService.saveToken(userDto.id, tokens.refreshToken, deviceId);

    return { ...tokens, user: userDto };
  }

  async logoutVK(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async getVKUser(vkUserId) {
    const user = await User.findOne({ where: { vkUserId } });
    const userDto = new UserDto(user);

    return userDto;
  }
}

module.exports = new UserService();
