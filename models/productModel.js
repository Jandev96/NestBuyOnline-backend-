import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  
    images: [
      {
        type: String, // Image URLs
        
      },
    ],
    isActive: [
      {
        type:Boolean,
        default:true
      }
    ],
    admin:[ { type: mongoose.Types.ObjectId, ref: "Admin" },],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review', // Reference to Review schema
      },
    ],
  },
  // {
  //   timestamps: true,
  // }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
