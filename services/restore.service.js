const { exec } = require("child_process")
const path = require("path")

const restoreBackup = (folderName) => {
    const mongoUri = process.env.CONNECTION_STRING;
    const backupPath = path.join(__dirname, "..", 'backups', folderName, process.env.DB_NAME)
    const command = `mongorestore --uri="${mongoUri}" --drop --gzip "${backupPath}"`

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log("[restore error]", error.message)
            return
        }
        console.log("[restore completed]", stdout || stderr)
    })
}
module.exports = { restoreBackup }