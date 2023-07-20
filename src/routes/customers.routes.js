import { Router } from "express";
import { createCustomer, getCustomerById, getCustomers, updateCustomer } from "../controllers/customers.controller.js";
import { CustomerSchema } from "../schemas/customer.schemas.js";
import validateSchema from "../middlewares/validateSchema.js";

const customersRouter = Router();

customersRouter.get("/customers", getCustomers)
customersRouter.get("/customers/:id", getCustomerById)
customersRouter.post("/customers", validateSchema(CustomerSchema), createCustomer)
customersRouter.put("/customers/:id", validateSchema(CustomerSchema), updateCustomer)

export default customersRouter;