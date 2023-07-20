import db from "../database/database.connection.js"

export async function getCustomers(req,res)
{
    try {
        const customers = await db.query(`SELECT * FROM customers;`);

        console.log(customers.rows);
        return res.send(customers.rows);
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export async function getCustomerById(req, res) {
    try {
        return res.send('');
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export async function createCustomer(req, res) {
    const { name, phone, birthday, cpf } = req.body
    try {
        return res.send('');
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export async function updateCustomer(req, res) {
    const { id } = req.params
    const { name, phone, birthday, cpf } = req.body

    try {
        return res.send('');
    } catch (err) {
        return res.status(500).send(err.message);
    }
} 