const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");

const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");
const reservationsRouter = require("./reservations/reservations.router");
const tablesRouter = require("./tables/tables.router")

const app = express();

// setting cross origin request url access
let clientUrl = process.env.REACT_APP_BASE_URL || "http://localhost:3000";
// process.env.REACT_APP_BASE_URL
// ? clientUrl = process.env.REACT_APP_BASE_URL
// : clientUrl = "http://localhost:3000";

// app-level middleware
app.use(express.json());
app.use(
  cors({
    origin: [clientUrl],
  })
);

app.use("/reservations", reservationsRouter);
app.use("/tables", tablesRouter)

app.use(notFound);
app.use(errorHandler);

module.exports = app;
