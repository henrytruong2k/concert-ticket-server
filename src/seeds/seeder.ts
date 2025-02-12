import User from "../models/userModel";
import { hashPassword } from "../utils/passwordUtils";

export const seedDatabase = async () => {
  try {
    const userCount = await User.estimatedDocumentCount();

    if (userCount > 0) return;

    console.log("Seeding user...");
    const hashedPassword = await hashPassword("123456");
    await User.insertMany([
      {
        email: "guest01@gmail.com",
        password: hashedPassword,
        role: "attendee",
      },
      {
        email: "admin01@gmail.com",
        password: hashedPassword,
        role: "manager",
      },
    ]);

    console.log("Seeding user completed!");
  } catch (error) {
    console.error("Seeding error:", error);
  }
};
