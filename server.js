const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app");

var DB = process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
  .then(console.log("connected"))
  .catch((err) => console.log(err));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server is listen to port ${port}`);
});
