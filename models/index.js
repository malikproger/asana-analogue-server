const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false,
});

const User = require('./user')(sequelize);
const Token = require('./token')(sequelize);
const Task = require('./task')(sequelize);

User.hasMany(Token, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Task, { foreignKey: 'userId', onDelete: 'CASCADE' });

Token.belongsTo(User, { foreignKey: 'userId' });
Task.belongsTo(User, { foreignKey: 'userId' });

sequelize
  .sync()
  .then(() => console.log('Database & tables synced!'))
  .catch((err) => console.log('Error: ' + err));

module.exports = {
  sequelize,
  User,
  Token,
  Task,
};
