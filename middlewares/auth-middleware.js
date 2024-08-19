const ApiError = require('../exceptions/api-error');
const tokenService = require('../services/token-service');

const authMiddleware = async function (req, _, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const isVKToken = accessToken?.slice(0, 2) === 'vk';

    let userData = null;

    if (isVKToken) {
      const {
        data: {
          user: { user_id: vkUserId },
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

      userData = await userService.getVKUser(vkUserId);
    } else {
      userData = tokenService.validateAccessToken(accessToken);
    }

    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    req.user = userData;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
};

module.exports = authMiddleware;
