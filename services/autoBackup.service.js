const cron = require("node-cron")
const { createBackup } = require("./backup.service");

cron.schedule('0 2 * * *', () => {
    console.log("Schedule backup running ...");
    createBackup();
    console.log("Schedule backup end ...")
})

