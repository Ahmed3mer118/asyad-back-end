const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        // Get the Payment collection
        const collection = mongoose.connection.collection('payments');

        // Drop the index by name (usually 'paymentMethod_1' based on the error)
        await collection.dropIndex('paymentMethod_1');
        console.log("Dropped index 'paymentMethod_1' successfully.");

        process.exit(0);
    } catch (err) {
        if (err.codeName === 'IndexNotFound') {
            console.log("Index not found, might have already been dropped.");
        } else {
            console.error("Error dropping index:", err);
        }
        process.exit(1);
    }
};

dropIndex();
