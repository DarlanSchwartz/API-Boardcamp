import { Router } from "express";
import { createGame, getGames } from "../controllers/games.controller.js";
import { GameSchema } from "../schemas/game.schemas.js";
import validateSchema from "../middlewares/validateSchema.js";

const gamesRouter = Router();

gamesRouter.get("/games", getGames);
gamesRouter.post("/games", validateSchema(GameSchema), createGame);

export default gamesRouter;