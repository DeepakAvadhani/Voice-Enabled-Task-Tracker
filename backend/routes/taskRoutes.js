const express = require("express");
const taskController = require("../controllers/taskController");
const transcriptionController = require("../controllers/transcriptorController");
const parseController = require("../controllers/parseController");
const upload = require("../services/upload");
const {
  validateTask,
  validateTaskUpdate,
} = require("../middleware/validation");
const router = express.Router();

router.post("/", validateTask, taskController.createTask);
router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.put("/:id", validateTaskUpdate, taskController.updateTask);
router.delete("/:id", taskController.deleteTask);
router.get("/search/query", taskController.searchTasks);

router.post(
  "/transcribe",
  upload.single("audio"),
  transcriptionController.transcribeAudio
);
router.post(
  "/trascribe-parse",
  upload.single("audio"),
  transcriptionController.transcribeAndParse
);

router.post("/parse", parseController.parseVoice);

module.exports = router;
