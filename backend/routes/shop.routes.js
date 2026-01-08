import express from "express"
import { createEditShop, getMyShop, getShopByCity } from "../controllers/shop.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"



import { validate } from "../middlewares/validate.js"
import { ShopSchema } from "../utils/schemas.js"

const shopRouter = express.Router()

shopRouter.post("/create-edit", isAuth, upload.single("image"), validate(ShopSchema.createEdit), createEditShop)
shopRouter.get("/get-my", isAuth, getMyShop)
shopRouter.get("/get-by-city/:city", isAuth, getShopByCity)

export default shopRouter