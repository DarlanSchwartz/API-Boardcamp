import dayjs from "dayjs";
import db from "../database/database.connection.js";


export async function getRentals(req,res)
{
    try {
        const rentals = await db.query(`SELECT * FROM rentals;`);
        return res.send(rentals.rows);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
}

export async function createRental(req,res)
{
    const {customerId,gameId,daysRented} = req.body;
    
    try {
        const customers = await db.query(`SELECT * FROM customers WHERE id=$1;`, [customerId]);
        if (customers.rowCount === 0) return res.status(400).send("Cliente inexistente!");

        const game = await db.query(`SELECT * FROM games WHERE id=$1;`,[gameId]);
        if(!game.rows[0]) return res.status(400).send("Jogo inexistente!");

        const pricePerDay  = game.rows[0].pricePerDay;

        await db.query(`INSERT INTO rentals ("customerId", "gameId", "daysRented", "rentDate", "originalPrice", "returnDate", "delayFee") VALUES ($1, $2, $3, $4, $5, null, null);`
        ,[customerId, gameId, daysRented, dayjs().format('YYYY-MM-DD'), pricePerDay * daysRented]);

        return res.sendStatus(201);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
}

export async function finishRental(req,res)
{
    try {
        return res.send('');
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
}

export async function deleteRental(req,res)
{
    try {
        return res.send('');
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
}