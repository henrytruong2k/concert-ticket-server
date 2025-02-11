import { Request, Response, NextFunction } from "express";

// Middleware Timeout (5 giây)
const timeoutMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort(); // Hủy request nếu quá thời gian
    res.status(408).json({ error: "Request timeout" }); // HTTP 408: Request Timeout
  }, 5000);

  (req as any).abortController = controller;

  res.on("finish", () => clearTimeout(timeout)); // Xóa timeout nếu request kết thúc bình thường
  next();
};

export default timeoutMiddleware;
