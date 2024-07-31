const TaskDto = require('../dtos/task-dto');
const { Task } = require('../models');

class TaskService {
  async getTasks(userId) {
    const tasks = await Task.findAll({ where: { userId } });
    return tasks;
  }

  async createTask({ name, description, isCompleted, userId }) {
    const createdTask = await Task.create({ name, description, isCompleted, userId });
    const createdTaskDto = new TaskDto(createdTask);
    return createdTaskDto;
  }

  async deleteTask(id) {
    const deletedTask = await Task.destroy({ where: { id } });
    const deletedTaskDto = new TaskDto(deletedTask);
    return deletedTaskDto;
  }

  async updateTask(task) {
    const updatedTask = await Task.update(task, { where: { id: task.id } });
    const updatedTaskDto = new TaskDto(updatedTask);
    return updatedTaskDto;
  }
}

module.exports = new TaskService();
