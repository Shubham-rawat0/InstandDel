import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Shop from "../models/shop.model.js";
export const createEditShop = async (req, res) => {
    try {
        const { name, city, state, address } = req.body;
        let image;
        if (req.file) {
            try {
                image = await uploadOnCloudinary(req.file.path);
                console.log("uploaded");
            }
            catch (err) {
                console.error("Cloudinary upload failed:", err);
                return res.status(500).json({ message: "Image upload failed" });
            }
        }
        let shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            shop = await Shop.create({
                name,
                city,
                state,
                address,
                image,
                owner: req.userId,
            });
        }
        else {
            shop = await Shop.findOneAndUpdate({ owner: req.userId }, {
                name,
                city,
                state,
                address,
                image,
                owner: req.userId,
            }, {
                new: true
            });
        }
        if (shop)
            await shop.populate("owner items");
        return res.status(201).json({ shop, message: "shop created" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: `error while creating shop`, error });
    }
};
export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId }).populate("owner").populate({ path: "items", options: { sort: { updatedAt: -1 } } });
        if (!shop) {
            return null;
        }
        return res.json(shop).status(200);
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: `error while getting shop data`, error });
    }
};
export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") },
        }).populate("items");
        if (!shops) {
            return res.status(400).json({ message: "shops not found" });
        }
        return res.status(200).json(shops);
    }
    catch (error) {
        res.status(500).json({ message: `error while getting shops in your city`, error });
    }
};
