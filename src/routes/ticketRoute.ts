import express from "express";
import ticketController from "../controllers/ticketController";

import auth from "../middlewares/auth";

const router = express.Router();

router.get("/ticket", auth, ticketController.getMany);
router.get("/ticket/:id", auth, ticketController.getOne);
router.post("/ticket", auth, ticketController.createOne);
router.post("/ticket/scan", auth, ticketController.scanTicket);

export default router;
