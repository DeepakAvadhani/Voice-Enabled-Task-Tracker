const express = require("express");
const { createTask, getAllTasks } = require("../controllers/taskController");
const { validateTaskCreation } = require("../middlewares/validationMiddleware");
const router = express.Router();

router.post("/tasks", validateTaskCreation, createTask);
router.get("/tasks", getAllTasks);
module.exports = router;