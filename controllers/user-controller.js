const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');
const userService = require('../services/user-service');

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Произошла ошибка при валидации данных', errors.array()));
      }

      const { email, password } = req.body;
      const { user, refreshToken, accessToken } = await userService.registration(email, password);

      res.cookie('refreshToken', refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.json({ user, accessToken });
    } catch (e) {}
  }
}
