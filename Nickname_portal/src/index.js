require("dotenv/config");
const { restRouter } = require("./api");
const config = require("./config");
const appManager = require("./app");
require("./errors");
const scheduler = require("./scheduler");
const path = require("path");
const cors = require("cors");
const db = require("./models");
global.appRoot = path.resolve(__dirname);
const express = require('express');
const PORT = 5000;
const app = appManager.setup(config);
/*cors handling*/
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.options("*", cors());
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

/* Route handling */
app.use("/api", restRouter);
// app.use('/', webRouter);

app.use((req, res, next) => {
  next(new RequestError("Invalid route", 404));
});

app.use((error, req, res, next) => {
  if (!(error instanceof RequestError)) {
    error = new RequestError("Some Error Occurred", 500, error.message);
  }
  error.status = error.status || 500;
  res.status(error.status);
  let contype = req.headers["content-type"];
  var json = !(!contype || contype.indexOf("application/json") !== 0);
  if (json) {
    return res.json({ errors: error.errorList });
  } else {
    res.render(error.status.toString(), { layout: null });
  }
});

// kue.init();
/* Database Connection */
db.sequelize
  .authenticate()
  .then(function () {
    console.log("Nice! Database looks fine");
    scheduler.init();
  })
  .catch(function (err) {
    console.log(err, "Something went wrong with the Database Update!");
  });

/* Start Listening service */
app.listen(PORT, () => {
  console.log(`Server is running at PORT http://localhost:${PORT}`);
});
