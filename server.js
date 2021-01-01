const express = require("express");
const app = express();
const connectDB = require("./config/db");

app.get("/", (req, res) => {
  res.send("Api is running!");
});

// MongoDB Connection
connectDB();

//Middlewares
app.use(express.json({extended: false}))

//Routes
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profiles", require("./routes/api/profiles"));
app.use("/api/users", require("./routes/api/users"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
