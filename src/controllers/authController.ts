import jwt from "jsonwebtoken";
import User from "../models/userModel";
import { verifyPassword } from "../utils/passwordUtils";

const authController = {
  async login(req, res) {
    try {
      const { email, password: passwordReq } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      if (!verifyPassword(passwordReq, user.password)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1y" },
      );

      const { password, ...userWithoutPassword } = user.toObject();
      return res.status(200).json({
        status: "success",
        message: "Login successful",
        data: {
          token,
          user: userWithoutPassword,
        },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
};

export default authController;
