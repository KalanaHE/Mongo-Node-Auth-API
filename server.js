const express = require("express");
const app = express();
const connectDB = require("./config/connectDB");

//Routes
const usersRoute = require("./routes/users");

connectDB();

app.use(express.json({ extended: false }));

app.use("/users", usersRoute);

app.get("/", (req, res) => {
  res.send("hello");
});

let PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at port : ${PORT}`);
});
