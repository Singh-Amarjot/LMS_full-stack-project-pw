// importing app from app.js 
import app from "./app.js";

// importing db connection
import dbConnect from "./config/dbConnect.js";
dbConnect();

// setting up port_number for the server 
const port = process.env.PORT || 5500;


// starting the server 
app.listen(port,()=>{
    console.log("APP IS LISTENING ON THE PORT",port)
})
