import express from "express"
import { createCustomer, createPaymentIntent, getPaymentRecords, getSavedPaymentMethods } from "../controllers/paymentController.js"
import { authUser } from "../middlewares/authUser.js"





const router = express.Router()

router.post("/create-customer",authUser, createCustomer)
router.post("/pay",authUser, createPaymentIntent)
router.get("/methods",authUser, getSavedPaymentMethods)
router.get("/records",authUser, getPaymentRecords)

export default router