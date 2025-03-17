import express from "express"
import {    addToCart, getCart, removeFromCart } from "../controllers/cartController.js"
import { authUser } from "../middlewares/authUser.js"

const router = express.Router()

//add to cart

router.post('/addtocart',authUser,addToCart)
router.get('/get-cart',authUser,getCart)
router.delete('/removeitem',authUser,removeFromCart)


export default router