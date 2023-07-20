import db from "../database/database.connection.js"

export async function getGames(req,res)
{
    try {
        const games = await db.query(`SELECT * FROM games;`);
        return res.send(games.rows);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
}

export async function createGame(req, res) {
    try {
        return res.sendStatus(201);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
} 