import Product from "../models/productModel.js"
import Review from "../models/reviewModel.js"
import { cloudinaryInstance } from "../config/cloudinary.js"

//get all products 

export const getAllProducts =async (req, res, next)=>{
    try{
        const productList= await Product.find()

        res.json({data:productList,message:'List of Products'})
    }
    catch (error){
        res.status(error.statusCode || 500).json({message: error.message} || "internal server")
    }
}


//GET ONE PRODUCT

export const getOneProduct =async (req,res,next)=>{

    try {
        const {productId}=req.params
        const displaySingleProduct= await Product.findById(productId)
        const productReview= await Review.findById(productId)

        res.json({data:{displaySingleProduct,productReview}, message:"user authorized"})
        
    } catch (error) {

        res.status(error.statusCode || 500).json({message: error.message} || "internal server")
    }
}

// CREATING A PRODUCT 

export const createProduct = async (req, res, next)=>{

    try {
        console.log(req.body)
        const {name , description, price, category, stock}=req.body
        // const images=req.file.images
       const adminId=req.admin.id
    
       console.log(req.file," requested file is present")

       const cloudinaryRes = await cloudinaryInstance.uploader.upload(req.file.path);
       console.log(cloudinaryRes.url)

        const newProduct = new Product({name , description, price, category, stock, images: cloudinaryRes.url, admin:adminId})
        newProduct.save()

        res.json({data:newProduct, message:"user authorized"})
        
    } catch (error) {

        res.status(error.statusCode || 500).json({message: error.message} || "internal server")
        
    }
}


// update a Product

// Update a Product
export const updateProduct = async (req, res, next) => {
    try {
      const { productId } = req.params; // Product ID to update
      const { name, description, price, category, stock } = req.body; // Updated fields
      const adminId = req.admin.id; // Admin ID from the decoded token
  
      // Find the product by ID
      const product = await Product.findById(productId);
  
      // If the product doesn't exist, return an error
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Check if the admin is authorized to update the product
//same as delete any admin can update product now commented for future use


    //   if (product.admin.toString() !== adminId) {
    //     return res.status(403).json({ message: "Not authorized to update this product" });
    //   }
  
      // Update the product fields
      if (name) product.name = name;
      if (description) product.description = description;
      if (price) product.price = price;
      if (category) product.category = category;
      if (stock) product.stock = stock;
  
      // If a new image is uploaded, update the image URL
      if (req.file) {
        const cloudinaryRes = await cloudinaryInstance.uploader.upload(req.file.path);
        product.images = cloudinaryRes.url;
      }
  
      // Save the updated product
      await product.save();
  
      res.status(200).json({ data: product, message: "Product updated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  };



  // Delete a Product
export const deleteProduct = async (req, res, next) => {
    try {
      const { productId } = req.params; // Product ID to delete
      const adminId = req.admin.id; // Admin ID from the decoded token
  
      // Find the product by ID
      const product = await Product.findById(productId);
  
      // If the product doesn't exist, return an error
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Check if the admin is authorized to delete the product || commented for any admin can delete the product . this code is commented so that it can be used for future use if created admin can only delete the product

    //   if (product.admin.toString() !== adminId) {
    //     return res.status(403).json({ message: "Not authorized to delete this product" });
    //   }
  
      // Delete the product
      await Product.findByIdAndDelete(productId);
  
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  };


//