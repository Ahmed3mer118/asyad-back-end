const cron = require('node-cron');
const { checkStock } = require('../controllers/productControllers');

cron.schedule('0 8 * * *', async () => {
    await checkStock();
});