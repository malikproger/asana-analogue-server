const { Task } = require('../models');

class TaskService {
  async getAllTasks(userId) {
    const tasks = await Task.getAll({ where: { userId } });
    return tasks;
  }

  async createTask(name, description, isCompleted) {
    const createdTask = await Task.create({ name, description, isCompleted });
    return createdTask;
  }

  async deleteTask(id) {
    const deletedTask = await Task.destroy({ where: { id } });
    return deletedTask;
  }

  async updateTask(task) {
    const updatedTask = await Task.update(task, { where: { id: task.id } });
    return updatedTask;
  }
}

module.exports = new TaskService();
