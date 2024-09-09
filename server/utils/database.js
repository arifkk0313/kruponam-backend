const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../../.env"),
});

mongoose
  .connect('mongodb+srv://arifkk0313:arifkk0313@cluster0.ixdyc.mongodb.net/kruponam-db?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the Database successfully");
  })
  .catch((err) => {
    console.log("Error in connecting to DB: ", err);
  });
