import User from "../models/userModel";
import bcrypt from "bcrypt";

const userController = {
  async createUser(req, res) {
    try {
      const { email, password, role } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        email,
        password: hashedPassword,
        role: role || "attendee", // Mặc định role là "attendee"
      });

      await newUser.save();

      return res.status(201).json({
        message: "User created successfully",
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

export default userController;
