import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import { authUser } from '../middlewares/authUser.js'; // Assuming authUser is in the same directory

export const addToCart = async (req, res) => {
  try {
    // Authenticate the user
    authUser(req, res, async () => {
      const { productId, quantity } = req.body;
      const userId = req.user.id; // Assuming the user ID is stored in the decoded token

      // Find the product to get its price
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Find the user's cart
      let cart = await Cart.findOne({ user: userId });

      // If the cart doesn't exist, create a new one
      if (!cart) {
        cart = new Cart({
          user: userId,
          products: [],
          totalPrice: 0,
        });
      }

      // Check if the product already exists in the cart
      const productIndex = cart.products.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (productIndex > -1) {
        // If the product exists, update the quantity
        cart.products[productIndex].quantity += quantity;
      } else {
        // If the product doesn't exist, add it to the cart
        cart.products.push({
          productId,
          quantity,
          price: product.price,
        });
      }

      // Calculate the total price
      cart.totalPrice = cart.products.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);

      // Save the cart
      await cart.save();

      res.status(200).json({ message: 'Product added to cart', cart });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCart = async (req, res) => {
    try {
      // Authenticate the user
      authUser(req, res, async () => {
        const userId = req.user.id; // Assuming the user ID is stored in the decoded token
  
        // Find the user's cart
        const cart = await Cart.findOne({ user: userId }).populate({
          path: 'products.productId',
          select: 'name price images', // Select the fields you want to populate
        });
  
        // If the cart doesn't exist, return an empty cart
        if (!cart) {
          return res.status(200).json({ message: 'Cart is empty', cart: { products: [], totalPrice: 0 } });
        }
  
        // Return the cart
        res.status(200).json({ message: 'Cart retrieved successfully', cart });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  export const removeFromCart = async (req, res) => {
    try {
      // Authenticate the user
      authUser(req, res, async () => {
        const { productId } = req.body; // Product ID to remove
        const userId = req.user.id; // Assuming the user ID is stored in the decoded token
  
        // Find the user's cart
        const cart = await Cart.findOne({ user: userId });
  
        // If the cart doesn't exist, return an error
        if (!cart) {
          return res.status(404).json({ message: 'Cart not found' });
        }
  
        // Find the index of the product in the cart
        const productIndex = cart.products.findIndex(
          (item) => item.productId.toString() === productId
        );
  
        // If the product doesn't exist in the cart, return an error
        if (productIndex === -1) {
          return res.status(404).json({ message: 'Product not found in cart' });
        }
  
        // Remove the product from the cart
        cart.products.splice(productIndex, 1);
  
        // Recalculate the total price
        cart.totalPrice = cart.products.reduce((total, item) => {
          return total + item.price * item.quantity;
        }, 0);
  
        // Save the updated cart
        await cart.save();
  
        // Return the updated cart
        res.status(200).json({ message: 'Product removed from cart', cart });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };