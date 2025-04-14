
import express from "express"
import { checkUser, signup, userLogin, userLogout, userProfile, userProfileUpdate } from "../controllers/userController.js"
import { authUser } from "../middlewares/authUser.js"
import { authAdmin } from "../middlewares/authAdmin.js"
import User from "../models/userModel.js"

const router = express.Router()

//sign up
router.post("/signup",signup)
// login 
router.post("/login",userLogin)
// profile
router.get("/profile",authUser,userProfile)
// profile edit
router.put("/update",authUser,userProfileUpdate)

// profile deactivate
router.put("/deactivate",authAdmin)

//logout
router.get("/logout",authUser,userLogout)

router.delete('/delete-account')
//password-forgot
router.get('/checkuser',authUser,checkUser)

// password change
router.put('/deactivateUser/:userId',authAdmin)

router.get("/recent",authAdmin, async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 }).limit(5);
    res.json(users);
  });
// address update
router.get("/",authAdmin, async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  });


export default router