const validateTask = (req, res, next) => {
  const { title, description, status, priority, due_date } = req.body;

  if (status) req.body.status = status.toLowerCase();
  if (priority) req.body.priority = priority.toLowerCase();

  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  if (title.length > 255) {
    return res.status(400).json({
      success: false,
      message: "Title must be less than 255 characters",
    });
  }

  const validStatuses = [
    "to do",
    "in progress",
    "done",
    "To Do",
    "In Progress",
    "Done",
  ];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be one of: To Do, In Progress, Done",
    });
  }

  const validPriorities = [
    "low",
    "medium",
    "high",
    "critical",
    "Low",
    "Medium",
    "High",
    "Critical",
  ];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: "Priority must be one of: Low, Medium, High, Critical",
    });
  }

  if (due_date) {
    const date = new Date(due_date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format for due_date",
      });
    }
  }

  next();
};

const validateTaskUpdate = (req, res, next) => {
  const { title, description, status, priority, due_date } = req.body;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required for update",
    });
  }

  if (title !== undefined) {
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
      });
    }

    if (title.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Title must be less than 255 characters",
      });
    }
  }

  const validStatuses = [
    "to do",
    "in progress",
    "done",
    "To Do",
    "In Progress",
    "Done",
  ];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be one of: To Do, In Progress, Done",
    });
  }

  const validPriorities = [
    "low",
    "medium",
    "high",
    "critical",
    "Low",
    "Medium",
    "High",
    "Critical",
  ];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: "Priority must be one of: Low, Medium, High, Critical",
    });
  }

  if (due_date) {
    const date = new Date(due_date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format for due_date",
      });
    }
  }

  next();
};

const validateTaskId = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID",
    });
  }

  next();
};

module.exports = {
  validateTask,
  validateTaskUpdate,
  validateTaskId,
};
