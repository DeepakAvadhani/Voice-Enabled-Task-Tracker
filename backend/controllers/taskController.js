const taskModel = require("../models/taskModel");

const taskController = {
  createTask: async (req, res, next) => {
    try {
      const { title, description, status, priority, dueDate, voiceTranscript, isVoiceCreated } = req.body;
      
      const task = await taskModel.create({
        title,
        description,
        status: status || 'To Do',
        priority: priority || 'Medium',
        due_date: dueDate,
        voice_transcript: voiceTranscript,
        is_voice_created: isVoiceCreated || false
      });

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  getAllTasks: async (req, res, next) => {
    try {
      const { sortBy, order, status, priority } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      
      const tasks = await Task.findAll(sortBy, order, filters);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  },

  getTaskById: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  updateTask: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description, status, priority, dueDate } = req.body;

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (status !== undefined) updates.status = status;
      if (priority !== undefined) updates.priority = priority;
      if (dueDate !== undefined) updates.due_date = dueDate;

      const task = await taskModel.update(id, updates);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  deleteTask: async (req, res, next) => {
    try {
      const { id } = req.params;

      const deleted = await taskModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  searchTasks: async (req, res, next) => {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query parameter "q" is required'
        });
      }

      const tasks = await taskModel.search(q);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  },

  filterByStatus: async (req, res, next) => {
    try {
      const { status } = req.params;
      
      const validStatuses = ['To Do', 'In Progress', 'Done'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: To Do, In Progress, Done'
        });
      }

      const tasks = await taskModel.filterByStatus(status);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  },

  filterByPriority: async (req, res, next) => {
    try {
      const { priority } = req.params;
      
      const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority. Must be one of: Low, Medium, High, Critical'
        });
      }

      const tasks = await taskModel.filterByPriority(priority);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  },

  getUpcomingTasks: async (req, res, next) => {
    try {
      const { days } = req.query;
      const tasks = await taskModel.findUpcoming(days ? parseInt(days) : 7);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  },

  getOverdueTasks: async (req, res, next) => {
    try {
      const tasks = await taskModel.findOverdue();

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  },

  getTaskStatistics: async (req, res, next) => {
    try {
      const stats = await taskModel.countByStatus();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  },

  deleteAllTasks: async (req, res, next) => {
    try {
      const result = await Task.deleteAll();

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = taskController;