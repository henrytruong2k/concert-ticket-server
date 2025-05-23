import express from "express";
import ticketController from "../controllers/ticketController";

import auth from "../middlewares/auth";

const router = express.Router();

router.get("/ticket", auth, ticketController.getMany);
router.get("/ticket/:id", auth, ticketController.getOne);
router.post("/ticket/scan", auth, ticketController.scanTicket);
router.post("/ticket/buy", auth, ticketController.buyTicket);
router.post("/ticket/ipn", ticketController.ipn);

export default router;
