import mongoose from "mongoose";
import { seedDatabase } from "../seeds/seeder";

const URI = process.env.MONGODB_URL;

mongoose.connect(`${URI}`).then(
  () => {
    console.log("MongoDB connected");
    seedDatabase();
  },
  (err) => console.log("Mongodb error: " + err),
);
