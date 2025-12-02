const taskModel = require("../models/taskModel");

const createTask = async (req, res, next) => {
  try {
    const task = await taskModel.create(req.body);
    res.status(201).json({
      success: true,
      message: "Task Created",
      task,
    });
  } catch (e) {
    next(e);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const queryInput = {};
    if (req.query.status) {
      queryInput.status = req.query.status;
    }
    if (req.query.priority) {
      queryInput.priority = req.query.priority;
    }
    if (req.query.is_voice_created) {
      queryInput.is_voice_created = req.query.is_voice_created === "true";
    }
    const tasks = await taskModel.findAll(queryInput);
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getAllTasks,
};


//left with the bunch of other controllers