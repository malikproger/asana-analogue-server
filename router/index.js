const { body } = require('express-validator');
const userController = require('../controllers/user-controller');
const taskController = require('../controllers/task-controller');
const authMiddleware = require('../middlewares/auth-middleware');

const Router = require('express').Router;

const router = new Router();

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 6, max: 128 }),
  userController.registration,
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/refresh', userController.refresh);

router.get('/getTasks', authMiddleware, taskController.getTasks);
router.post('/createTask', authMiddleware, taskController.createTask);
router.delete('/deleteTask', authMiddleware, taskController.deleteTask);
router.put('/updateTask', authMiddleware, taskController.updateTask);

module.exports = router;
