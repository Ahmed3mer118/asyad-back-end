const cors = require("cors")

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',')
const corsOptions = {
    origin : function(origin, cb){
        if(!origin) return cb(null , true) // allowed to server to server if true
        if(allowedOrigins.includes(origin)) {
            return cb(null , true)
        }else{
            return cb(new Error("CORS POLICY Origin Not Allowed"))
        }
    },
    credentials: true, // allow sending cookies / authirization headers
    mehtods:['GET','POST','PUT','DELETE'],
    allowedHeaders:["Content-Type","Authorization"]

}

module.exports = cors(corsOptions)