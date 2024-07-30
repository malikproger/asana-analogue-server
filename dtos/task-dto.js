class TaskDto {
  constructor(model) {
    this.name = model.name;
    this.isCompleted = model.isCompleted;
    this.createdAt = model.createdAt;
  }
}

module.exports = TaskDto;
