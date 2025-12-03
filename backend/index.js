require("dotenv").config();
const express = require("express");
const cors = require("cors");
const taskroutes = require("./routes/taskRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/tasks", taskroutes);

app.get("/api/health", (req, res) => {
  res.status(200).send("Server is up and Running!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});