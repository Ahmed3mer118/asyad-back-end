const dotenv = require("dotenv");
dotenv.config();

const app = require("./expressApp");
const connectDB = require("./config/db.config");
const { ensureRoles } = require("./services/ensureRoles.service");

connectDB();
ensureRoles();

if (!process.env.VERCEL) {
  require("./services/autoBackup.service");
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log("Start Server : " + PORT);
  });
}
