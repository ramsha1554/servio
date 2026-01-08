import express from "express"

import isAuth from "../middlewares/isAuth.js"
import { addItem, deleteItem, editItem, getItemByCity, getItemById, getItemsByShop, rating, searchItems } from "../controllers/item.controllers.js"
import { upload } from "../middlewares/multer.js"



import { validate } from "../middlewares/validate.js"
import { ItemSchema } from "../utils/schemas.js"

const itemRouter = express.Router()

itemRouter.post("/add-item", isAuth, upload.single("image"), validate(ItemSchema.addEdit), addItem)
itemRouter.post("/edit-item/:itemId", isAuth, upload.single("image"), validate(ItemSchema.addEdit), editItem)
itemRouter.get("/get-by-id/:itemId", isAuth, getItemById)
itemRouter.get("/delete/:itemId", isAuth, deleteItem)
itemRouter.get("/get-by-city/:city", isAuth, getItemByCity)
itemRouter.get("/get-by-shop/:shopId", isAuth, getItemsByShop)
itemRouter.get("/search-items", isAuth, searchItems)
itemRouter.post("/rating", isAuth, validate(ItemSchema.rating), rating)
export default itemRouter