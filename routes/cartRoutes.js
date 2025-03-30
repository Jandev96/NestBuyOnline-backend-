import express from "express"
import {    addToCart, cartQuantity, getCart, removeFromCart } from "../controllers/cartController.js"
import { authUser } from "../middlewares/authUser.js"

const router = express.Router()

//add to cart

router.post('/addtocart',authUser,addToCart)
router.get('/get-cart',authUser,getCart)
router.delete('/removeitem/:productId',authUser,removeFromCart)
router.put('/update-quantity',cartQuantity)


export default router