import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,  
    updateAccountDetails
} from "../controller/usercontroller.js";
//import {urlcontroller} from "../controller/urlcontroller.js";
//import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middleware/authmiddleware.js";


const router = Router()


router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
//router.route("/add").post(verifyJWT, urlcontroller)


export default router