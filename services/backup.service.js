const { exec } = require("child_process")
const path = require("path")
const fs = require("fs")


const createBackup = () => {
    const timestamps = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFolder = path.join(__dirname, "..", "backups", `backup-${timestamps}`)
    if (fs.existsSync(backupFolder)) {
        fs.mkdirSync(backupFolder, { recursive: true })
    }
    const mongoUri = process.env.CONNECTION_STRING;
    const command = `mongodump --uri="${mongoUri}" --out="${backupFolder}" --gzip`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log("[backup error]", error.message)
            return
        }
        console.log("[backup completed]", stdout || stderr)
    })
}

module.exports = { createBackup }