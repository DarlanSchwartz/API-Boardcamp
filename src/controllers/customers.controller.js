import dayjs from "dayjs";
import db from "../database/database.connection.js"

export async function getCustomers(req, res) {
    const { offset, limit, order, desc } = req.query;

    try {

        let query = 'SELECT * FROM customers';
        
        if (order) {
            query += ` ORDER BY ${order}`;
            if (desc && desc.toLowerCase() === 'true') {
                query += ' DESC';
            }
        }

        if (limit) {
            query += ` LIMIT ${limit}`;
            if (offset) {
                query += ` OFFSET ${offset}`;
            }
        }

        const customers = await db.query(query, []);
        customers.rows.forEach(customer =>{
            customer.birthday = dayjs(customer.birthday).format('YYYY-MM-DD');
        });
        return res.send(customers.rows);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function getCustomerById(req, res) {
    const { id } = req.params;

    try {
        const customer = await db.query(`SELECT * FROM customers WHERE id=$1;`, [id]);
        if (!customer.rows[0]) return res.status(404).send('Usuário não existe!');
        customer.rows[0].birthday = dayjs(customer.rows[0].birthday).format('YYYY-MM-DD');
        return res.send(customer.rows[0]);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function createCustomer(req, res) {
    const { name, phone, birthday, cpf } = req.body
    try {
        const customer = await db.query(`SELECT * FROM customers WHERE cpf=$1`, [cpf]);
        if (customer.rowCount > 0) return res.status(409).send('Cpf já cadastrado');

        await db.query(`INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)`, [name, phone, cpf, birthday]);

        return res.sendStatus(201);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function updateCustomer(req, res) {
    const { id } = req.params;
    const { name, phone, birthday, cpf } = req.body;

    try {
        const customer = await db.query(`SELECT * FROM customers WHERE cpf=$1`, [cpf]);
        if (customer.rowCount > 0 && customer.rows[0].id !== Number(id)) return res.status(409).send('Cpf já foi cadastrado com outro usuário!');
        const updatedCustomer = await db.query(`UPDATE customers
                                         SET name = $1, phone = $2, cpf = $3, birthday = $4
                                         WHERE id = $5`, [name, phone, cpf, birthday, id]);
        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error.message);
    }
} 