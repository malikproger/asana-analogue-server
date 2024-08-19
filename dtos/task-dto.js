class TaskDto {
  constructor(model) {
    this.id = model.id;
    this.name = model.name;
    this.description = model.description;
    this.isCompleted = model.isCompleted;
    this.createdAt = model.createdAt;
  }
}

module.exports = TaskDto;
