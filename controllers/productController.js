import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js";
import { cloudinaryInstance } from "../config/cloudinary.js";

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const productList = await Product.find();
    res.json({ data: productList, message: "List of Products" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
  }
};

// Get one product
export const getOneProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const displaySingleProduct = await Product.findById(productId);
    const productReview = await Review.findById(productId);

    res.json({ data: { displaySingleProduct, productReview }, message: "Product details fetched successfully" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
  }
};

// Create a product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const adminId = req.admin.id;

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const cloudinaryRes = await cloudinaryInstance.uploader.upload(req.file.path);
    const secureImageUrl = cloudinaryRes.secure_url || cloudinaryRes.url.replace("http://", "https://");

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      stock,
      images: secureImageUrl,
      admin: adminId,
    });

    await newProduct.save();

    res.json({ data: newProduct, message: "Product created successfully" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, category, stock } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock) product.stock = stock;

    if (req.file) {
      const cloudinaryRes = await cloudinaryInstance.uploader.upload(req.file.path);
      product.images = cloudinaryRes.secure_url || cloudinaryRes.url.replace("http://", "https://");
    }

    await product.save();

    res.status(200).json({ data: product, message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
