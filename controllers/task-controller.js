const taskService = require('../services/task-service');

class TaskController {
  async getTasks(req, res, next) {
    try {
      const { id: userId } = req.user;
      const tasks = await taskService.getTasks(userId);

      return res.json(tasks);
    } catch (e) {
      next(e);
    }
  }

  async createTask(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { name, description, isCompleted } = req.body;

      const createdTask = await taskService.createTask({ name, description, isCompleted, userId });

      return res.status(201).json(createdTask);
    } catch (e) {
      next(e);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const { id: taskId } = req.body;

      await taskService.deleteTask(taskId);

      return res.status(204).end();
    } catch (e) {
      next(e);
    }
  }

  async updateTask(req, res, next) {
    try {
      const { name, description, isCompleted, id } = req.body;

      await taskService.updateTask({ name, description, isCompleted, id });

      return res.end();
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new TaskController();
