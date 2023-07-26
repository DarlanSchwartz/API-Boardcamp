import dayjs from "dayjs";
import db from "../database/database.connection.js";

function helperStartDateFilter(startDate) {
    if (startDate) {
        return 'rentals.rentDate >= $1';
    }
    return '';
}

// Função auxiliar para construir a cláusula de filtro por status
function helperStatusFilter(status) {
    if (status === 'open') {
        return 'rentals.returnDate IS NULL';
    } else if (status === 'closed') {
        return 'rentals.returnDate IS NOT NULL';
    }
    return '';
}


export async function getRentals(req, res) {
    const { offset, limit, order, desc, customerId, gameId, status, startDate } = req.query;

    try {
        let query = `
        SELECT 
          rentals.*,
          customers.name AS "customerName",
          games.name AS "gameName"
        FROM rentals
        JOIN customers ON rentals."customerId" = customers.id
        JOIN games ON rentals."gameId" = games.id
      `;
        const queryParams = [];

        // Handle customer filter
        if (customerId) {
            query += ` WHERE rentals."customerId" = $${queryParams.length + 1}`;
            queryParams.push(customerId);
        }

        // Handle game filter
        if (gameId) {
            query += query.includes('WHERE') ? ' AND ' : ' WHERE ';
            query += `rentals."gameId" = $${queryParams.length + 1}`;
            queryParams.push(gameId);
        }

        // Handle status filter
        if (status) {
            const statusFilter = helperStatusFilter(status);
            if (statusFilter) {
                query += query.includes('WHERE') ? ' AND ' : ' WHERE ';
                query += statusFilter;
            }
        }

        // Handle start date filter
        if (startDate) {
            const startDateFilter = helperStartDateFilter(startDate);
            if (startDateFilter) {
                query += query.includes('WHERE') ? ' AND ' : ' WHERE ';
                query += startDateFilter;
                queryParams.push(startDate);
            }
        }

        // Handle sorting
        if (order) {
            query += ` ORDER BY "${order}"`;
            if (desc && desc.toLowerCase() === 'true') {
                query += ' DESC';
            }
        }

        // Handle offset and limit
        if (limit) {
            query += ` LIMIT ${limit}`;
            if (offset) {
                query += ` OFFSET ${offset}`;
            }
        }

        const rentals = await db.query(query, queryParams);

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
            };

            delete rentalResponse.customerId;
            delete rentalResponse.gameId;
            delete rentalResponse.customerName;
            delete rentalResponse.gameName;

            return rentalResponse;
        });

        return res.send(allRentals);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
}

export async function createRental(req, res) {
    const { customerId, gameId, daysRented } = req.body;

    try {

        if (!daysRented || daysRented <= 0) return res.status(400).send("O campo daysRented tem que ser maior que 0!");

        const customers = await db.query(`SELECT * FROM customers WHERE id=$1;`, [customerId]);
        if (customers.rowCount === 0) return res.status(400).send("Cliente inexistente!");

        const game = await db.query(`SELECT * FROM games WHERE id=$1;`, [gameId]);
        if (!game.rows[0]) return res.status(400).send("Jogo inexistente!");

        const rentalCountResult = await db.query(`SELECT COUNT(*) FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL;`, [gameId]);
        const rentalCount = Number(rentalCountResult.rows[0].count);

        if (game.rows[0].stockTotal <=0 || rentalCount >= game.rows[0].stockTotal) return res.status(400).send('Todos os jogos ja foram alugados!');
        await db.query(`UPDATE games SET "stockTotal" = "stockTotal" - 1 WHERE id = $1`, [gameId]);

        const pricePerDay = game.rows[0].pricePerDay;

        await db.query(`INSERT INTO rentals ("customerId", "gameId", "daysRented", "rentDate", "originalPrice", "returnDate", "delayFee") VALUES ($1, $2, $3, $4, $5, null, null);`
            , [customerId, gameId, daysRented, dayjs().format('YYYY-MM-DD'), pricePerDay * daysRented]);



        return res.sendStatus(201);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
}

export async function finishRental(req, res) {
    const { id } = req.params;

    if (!id || id == '') return res.sendStatus(404);

    try {
        const rental = await db.query(`SELECT * FROM rentals WHERE id=$1;`, [id]);
        if (rental.rowCount === 0) return res.status(404).send("Aluguel não existe!");
        if (rental.rows[0].returnDate !== null) return res.status(400).send("Esse aluguel ja foi devolvido!");

        const { originalPrice, daysRented, rentDate } = rental.rows[0];
        const pricePerDay = originalPrice / daysRented;

        let delayFee = null;

        const daysDifference = dayjs().diff(dayjs(rentDate), 'days');

        if (daysDifference > daysRented) {
            delayFee = pricePerDay * (daysDifference - daysRented);
        }

        await db.query(`UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3;`, [dayjs().format('YYYY-MM-DD'), delayFee, id]);

        return res.sendStatus(200);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
}

export async function deleteRental(req, res) {
    const { id } = req.params;

    if (!id || id == '') return res.sendStatus(404);

    try {
        const rental = await db.query(`SELECT * FROM rentals WHERE id=$1;`, [id]);
        if (rental.rowCount === 0) return res.status(404).send("Aluguel não existe!");
        await db.query(`DELETE FROM rentals WHERE id=$1;`, [id]);
        return res.sendStatus(202);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
}