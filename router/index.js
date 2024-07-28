const Router = require('express').Router;

const router = new Router();

router.post('/registration', (req, res) => {
  res.send('test');
});

module.exports = router;
