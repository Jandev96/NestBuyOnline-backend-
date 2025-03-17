import mongoose from "mongoose";
import Order from "../models/orderModel.js"
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import { startSession } from "mongoose";
import { authUser } from "../middlewares/authUser.js";

// Create Order (Handles out-of-stock cases and fetches totalPrice from cart)

export const createOrder = async (req, res) => {
    const session = await startSession();
    session.startTransaction();

    // Define originalStock outside the try block
    const originalStock = new Map();

    try {
        const customerId = req.user?.id;
        
        if (!customerId) {
            await session.abortTransaction();
            return res.status(401).json({ message: "User not authorized" });
        }

        console.log("User ID:", customerId); // Debugging Log

        // Fetch the user's cart (without session to avoid potential issues)
        const cart = await Cart.findOne({ user: customerId });

        console.log("Cart Retrieved:", cart); // Debugging Log

        if (!cart || !cart.products || cart.products.length === 0) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Cart is empty or not found" });
        }

        console.log("Cart Products:", cart.products); // Debugging Log

        // Recalculate total price
        cart.calculateTotalPrice();
        await cart.save({ session });

        // Check stock and update inventory
        for (let item of cart.products) {
            const product = await Product.findById(item.productId).session(session);
            if (!product || product.stock < item.quantity) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Some products are out of stock" });
            }
            originalStock.set(product._id.toString(), product.stock);
            product.stock -= item.quantity;
            await product.save({ session });
        }

        // Set estimated delivery date
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 4) + 3);

        // Apply discounts and tax
        const discount = 0;
        const tax = cart.totalPrice * 0.1;
        const finalPrice = cart.totalPrice - discount + tax;

        // Prepare order products
        const orderProducts = cart.products.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        }));

        // Create the order
        const order = new Order({
            customerId,
            products: orderProducts,
            totalPrice: finalPrice,
            discount,
            tax,
            shippingAddress: req.body.shippingAddress,
            estimatedDelivery,
        });

        await order.save({ session });

        // Clear cart
        await Cart.deleteOne({ _id: cart._id }, { session });

        await session.commitTransaction();
        res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        await session.abortTransaction();

        // Restore stock if needed
        for (let [productId, stock] of originalStock) {
            await Product.findByIdAndUpdate(productId, { stock }, { session });
        }

        console.error("Order Error:", error); // Log full error for debugging
        res.status(500).json({ message: "Error placing order", error: error.message });
    } finally {
        session.endSession();
    }
};

  

// Get all Orders (Admin only)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.productId", "name price image")
      .populate("customerId", "username email")
      .select("customerId orderDate status estimatedDelivery products totalPrice");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// Get User Orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .populate("products.productId", "name price image")
      .select("orderDate status estimatedDelivery products totalPrice");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// Get Order by ID
export const getOrderById = async (req, res) => {
    try {
      console.log("Received Request Params:", req.params); // Debugging
  
      if (!req.params.id) {
        return res.status(400).json({ message: "Order ID is missing in the request." });
      }
  
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
  
      const order = await Order.findById(req.params.id)
        .populate("products.productId", "name price image")
        .populate("customerId", "username email")
        .select("orderDate status estimatedDelivery products totalPrice");
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order", error: error.message });
    }
  };
  
  

// Update Order Status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
      .populate("products.productId", "name price image")
      .select("status estimatedDelivery");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: "Error updating order status", error: error.message });
  }
};

// Delete Order (Admin only) & Restore Stock if Order is Cancelled
export const deleteOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Restore stock for all products in the canceled order
    for (let item of order.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await order.deleteOne();
    res.json({ message: "Order deleted and stock restored" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
};

