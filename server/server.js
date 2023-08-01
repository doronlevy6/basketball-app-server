const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./controllers/userController");

app.use(cors()); // Enable CORS

app.use(express.json());
app.use("/", userRoutes);

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
