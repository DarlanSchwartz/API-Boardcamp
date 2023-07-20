import dayjs from "dayjs";
import db from "../database/database.connection.js";


export async function getRentals(req,res)
{
    try {
        const rentals = await db.query(`SELECT rentals.*, games.name AS "gameName", customers.name AS "customerName" FROM rentals
        JOIN customers ON rentals."customerId" = customers.id
        JOIN games ON rentals."gameId" = games.id;`);

        const allRentals = rentals.rows.map((rent) => {

            const rentalResponse = {
                ...rent,
                customer: {
                    id: rent.customerId,
                    name: rent.customerName
                },
                game: {
                    id: rent.gameId,
                    name: rent.gameName
                }
            }

            delete rentalResponse.customerName;
            delete rentalResponse.gameName;
            return rentalResponse;
        })

        return res.send(allRentals);
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
    const {id} = req.params;
       
    try { 
        const rental = await db.query(`SELECT * FROM rentals WHERE id=$1`, [id]);
        if (rental.rowCount === 0) return res.status(404).send("Aluguel não existe!");
        if (rental.rows[0].returnDate !== null) return res.status(400).send("Esse aluguel ja foi devolvido!");
    
        const { originalPrice, daysRented, rentDate } = rental.rows[0];
        const pricePerDay = originalPrice / daysRented;
        
        let delayFee = null;

        const daysDifference = dayjs().diff(dayjs(rentDate), 'days');
    
        if (daysDifference > daysRented) {
            delayFee = pricePerDay * (daysDifference - daysRented);
        }

        await db.query(`UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3;`,[dayjs().format('YYYY-MM-DD'),delayFee,id]);

        return res.sendStatus(200);
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