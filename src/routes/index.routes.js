import { Router } from "express";
import rentalRouter from "./rental.routes.js";
import gamesRouter from "./games.routes.js";
import customersRouter from "./customers.routes.js";

const router = Router();

router.use(rentalRouter);
router.use(gamesRouter);
router.use(customersRouter);

export default router;