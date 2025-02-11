import express from "express";
import eventController from "../controllers/eventController";
import auth from "../middlewares/auth";

const router = express.Router();

router.get("/event", eventController.getMany);
router.get("/event/:id", eventController.getOne);
router.post("/event", auth, eventController.createOne);

export default router;
