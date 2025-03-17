import User from "../models/userModel.js"
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";


export const signup = async(req, res, next)=>{
    try{
        // res.json({data: data, message:"signup success"})
        console.log("sign up is working")

        //collect user data
        const {username,email,password,confirmPassword,address,profilePic}=req.body

        //data validation
        if(!username || !email || !password || !confirmPassword  ){
            return res.status(400).json({message:"all fields required"})
        }
        console.log(username,email,password)

      



        //check if user already exist 
        const userExist= await User.findOne({email}) 

        if(userExist){
          return  res.status(400).json({message:"user already exist"})
        }
        if(password!=confirmPassword ){
            return res.status(400).json({message:'confirm password error'})
        }

          //password hashing
        const hashPassword = bcrypt.hashSync(password, 10);
        
        const newUser= new User({username,email,password:hashPassword,address,profilePic})
        await newUser.save()

        //generate token id and role using
        const token =generateToken(newUser._id,'user')
        res.cookie('token',token)



        res.json({data: newUser, message:'signup success'})



    }
    catch(error){
        res.status(error.statusCode || 500).json({message: error.message || "Internal Server Error"})
        console.log(error)
    }
}

//user login page


export const userLogin =async (req,res, next)=>{
    try{
       //collect user data
       const {email,password}=req.body
        
              


       //data validation
       if(!email||!password){
        return res.status(400).json({message:"all fields required"})
       }

       //user exist -check
       const userExist= await User.findOne({email})

       if(!userExist){
        return res.status(404).json({message:"user not found"})
       }



       // check db password is matched
       const passwordMatch=bcrypt.compareSync(password, userExist.password)

       if(!passwordMatch){
        return res.status(401).json({message:"invalid credentials"})
       }

       if(!userExist.isActive){
        return res.status(401).json({message:"user account is not valid"})
       }
       
       //generate token 
       const token =generateToken(userExist._id,'user')
       res.cookie('token',token)

       const { password: _, ...userWithoutPassword } = userExist.toObject();

       res.json({data: userWithoutPassword, message:'login successful'})


    }
    catch(error){
        res.status(error.statusCode || 500).json({message: error.message || "Internal Server Error"})
        console.log(error)
    }

   
}

export const userProfile =async (req, res, next)=>{
    try{
        //user id 

        const userId=req.user.id
        
        const userData= await User.findById(userId)
        res.json({data:userData,message:"user profile fetched"})
    }
    catch(error){
        res.status(error.statusCode || 500).json({message: error.message} || "internal server")

    }
}

export const userProfileUpdate= async (req,res,next)=>{
    try {
        const {username,email,password,address,profilePic} =req.body

        const hashPassword = bcrypt.hashSync(password, 10);

        const userId=req.user.id
        const userupdateData= await User.findByIdAndUpdate(userId,{username,email,password:hashPassword,address,profilePic},{new:true})
       
        res.json({data:userupdateData,message:"user profile updated"})
    
        
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
        
    }
}

export const userLogout = async (req,res,next)=>{
    
    try {
        res.clearCookie('token')
        res.json({message:"user successfully logged out"})
        
    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message} || "internal server")
    }
}
export const checkUser= async( req,res,next)=>{

    try {
        res.json({message:"user is authorized"})
        
    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message} || "internal server")
    }
}