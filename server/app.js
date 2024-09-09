const express = require("express");
const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, "../.env"),
});
const cors = require("cors");

require("./utils/database"); // Assuming this sets up your database connection
const app = express();

app.use('/assets', express.static('assets'))

const http = require('http');
const server = http.createServer(app);


const mainRoute = require("./routes/mainRoute");

var corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', (req, res, next) => {
    console.log(req.method, req.path);
    next();
});


app.use("/api/v2/kruponam", mainRoute);

const PORT = process.env.PORT_ONE || 3019;
server.listen(PORT, () => {
    console.log("Server is listening on Port:", PORT);
});
