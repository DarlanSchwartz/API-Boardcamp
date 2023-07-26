import db from "../database/database.connection.js"

export async function getGames(req, res) {
    //http://localhost:5000/games?limit=2&desc=true&order=name&offset=2
    // max limit of 2 games response ordered by name starting at position 2 and descending order
    const { offset, limit, order, desc, name } = req.query;
    
    try {
        let query = 'SELECT * FROM games';
        const queryParams = [];

        if (name) {
            query += ` WHERE LOWER(name) LIKE $${queryParams.length + 1}`;
            queryParams.push(name.toLowerCase() + '%');
        }

        if (order) {
            query += ` ORDER BY "${order}"`;
            if (desc && desc.toLowerCase() === 'true') {
                query += ' DESC';
            }
        }

        if (limit) {
            query += ` LIMIT ${limit}`;
        }

        if (offset) {
            query += ` OFFSET ${offset}`;
        }

        const games = await db.query(query, queryParams);
        return res.send(games.rows);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
}

export async function createGame(req, res) {
    const { name, image, stockTotal, pricePerDay } = req.body;


    try {
        const foundGames = await db.query(`SELECT COUNT(*) as total FROM games WHERE "name"= $1`, [name]);

        if(foundGames.rows[0].total > 0) return res.sendStatus(409);

        await db.query(`INSERT INTO games ("name", "image", "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4);`, [name, image, stockTotal, pricePerDay]);
        return res.sendStatus(201);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
} 