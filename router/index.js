const { body } = require('express-validator');
const userController = require('../controllers/user-controller');

const Router = require('express').Router;

const router = new Router();

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 6, max: 128 }),
  userController.registration,
);
router.post('/login', userController.login);

module.exports = router;
