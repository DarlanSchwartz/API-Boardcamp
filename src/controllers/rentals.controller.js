import db from "../database/database.connection.js"

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
    try {
        return res.send('');
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