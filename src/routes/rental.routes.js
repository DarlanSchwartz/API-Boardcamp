import { Router } from "express";
import { createRental, deleteRental, finishRental, getRentals } from "../controllers/rentals.controller.js";
import { RentalSchema } from "../schemas/rental.schemas.js";
import validateSchema from "../middlewares/validateSchema.js";

const rentalRouter = Router();

rentalRouter.get('/rentals',getRentals); 
rentalRouter.post("/rentals", validateSchema(RentalSchema), createRental);
rentalRouter.post("/rentals/:id/return", finishRental);
rentalRouter.delete("/rentals/:id", deleteRental);

export default rentalRouter;