
import express from "express"
import { adminLogin, checkadmin } from "../controllers/adminController.js"
import { authAdmin } from "../middlewares/authAdmin.js"
import { adminProfile } from "../controllers/adminController.js"
import { adminProfileUpdate } from "../controllers/adminController.js"
import { adminLogout } from "../controllers/adminController.js"
import { signup } from "../controllers/adminController.js"


const router = express.Router()

//sign up
router.post("/signup",signup)
// login 
router.post("/login",adminLogin)
// profile
router.get("/profile",authAdmin,adminProfile)
// profile edit
router.put("/update",authAdmin,adminProfileUpdate)

// profile deactivate
router.put("/deactivate",authAdmin)

//logout
router.get("/logout",authAdmin,adminLogout)

router.delete('/delete-account')
//password-forgot
router.get('/checkadmin',authAdmin,checkadmin)

// password change
router.put('/deactivateUser/:userId',authAdmin)
// address update

export default router