import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";

export interface IReqAuth extends Request {
  user?: any;
}

const auth = async (
  req: IReqAuth,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const token = req.header("Authorization");
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(400).json({ message: "Yêu cầu token" });
  }

  const tokenValue = token.split(" ")[1];
  try {
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET as string);
    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    const user = await User.findOne({ _id: decoded.id }).select("-password");

    if (!user) return res.status(401).json({ message: "User does not exist" });
    req.user = user;
    next();
  } catch (err: any) {
    console.log(err);
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token hết hạn" });
    }
    return res.status(500).json({ message: err.message });
  }
};

export default auth;
