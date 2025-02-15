import express from "express";
import eventController from "../controllers/eventController";
import auth from "../middlewares/auth";
import upload from "../middlewares/upload";

const router = express.Router();

router.get("/event", eventController.getMany);
router.get("/event/:id", eventController.getOne);
router.post("/event", auth, upload.single("file"), eventController.createOne);
router.delete("/event/:id", auth, eventController.deleteOne);

export default router;
