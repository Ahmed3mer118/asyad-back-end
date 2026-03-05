const express = require("express");
const app = express();
const connectDB = require("./config/db.config");
const dotenv = require("dotenv");
const router = require("./router.js");
const logger = require("./utils/logger.util");
const errorHandler = require("./middleware/error-handler.middleware");
dotenv.config();
const PORT = process.env.PORT || 3000;
// const cors = require('cors');
// app.use(cors( {
//     origin:"http://localhost:4200"
// }))
const path = require("path");
const corsMiddlewate = require("./middleware/cors.mddleware");
app.use(corsMiddlewate);
require("./services/autoBackup.service")
const { ensureRoles } = require("./services/ensureRoles.service");

app.use(express.json());
connectDB();
ensureRoles();

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`Request: ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms`, {
      user: req.user?.id
    });
  });
  next();
});


app.use('/api/v1', router);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Start Server : " + PORT);
});
