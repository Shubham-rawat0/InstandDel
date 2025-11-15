import express from "express"
import { getCurrentUser, updateUserLocation } from "../controllers/user.controllers.js"
import isAuth from "../middlewares/isAuth.js"

const router=express.Router()

router.get("/current",isAuth,getCurrentUser)
router.post("/update-location",isAuth,updateUserLocation)
export default router