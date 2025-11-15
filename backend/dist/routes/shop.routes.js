import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createEditShop, getMyShop, getShopByCity } from "../controllers/shop.controllers.js";
import { upload } from "../middlewares/multer.js";
const router = express.Router();
router.post("/create-edit", isAuth, upload.single("image"), createEditShop);
router.get("/get-my", isAuth, getMyShop);
router.get("/get-by-city/:city", isAuth, getShopByCity);
export default router;
