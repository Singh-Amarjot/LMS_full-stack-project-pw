// setting up datatbase connection
// importing mongoose

import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log("db connected successfully", connection.host);
  } catch (err) {
    console.log(err.message);
  }
};

//exporting dbConnect function
export default dbConnect;
