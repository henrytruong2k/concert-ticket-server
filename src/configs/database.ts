import mongoose from "mongoose";

const URI = process.env.MONGODB_URL;

mongoose.connect(`${URI}`).then(
  () => console.log("Mongodb connected"),
  (err) => console.log("Mongodb error: " + err),
);
