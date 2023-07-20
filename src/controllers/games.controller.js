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
    const { name, image, stockTotal, pricePerDay } = req.body;
    try {
        await db.query(`INSERT INTO customers (name, image, stockTotal, pricePerDay) VALUES ($1, $2, $3, $4)`,[name,image,stockTotal,pricePerDay]);
        return res.sendStatus(201);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
} 