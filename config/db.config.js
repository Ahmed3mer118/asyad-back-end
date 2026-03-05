const mongoose = require('mongoose');

const connectDB = async ()=>{
    try{
    const conectionString = process.env.DB_URL;
    const connection = await mongoose.connect(conectionString);
     console.log(`MongoDB Connected : ${connection.connection.host}`);
    }
    catch(err){
        console.log(`Database connection error: ${err.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;