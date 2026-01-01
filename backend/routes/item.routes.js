import express from "express"

import isAuth from "../middlewares/isAuth.js"
import { addItem, deleteItem, editItem, getItemByCity, getItemById, getItemsByShop, rating, searchItems } from "../controllers/item.controllers.js"
import { upload } from "../middlewares/multer.js"



const itemRouter=express.Router()

itemRouter.post("/add-item",isAuth,upload.single("image"),addItem) // upload is multer middleware
itemRouter.post("/edit-item/:itemId",isAuth,upload.single("image"),editItem)// editing item vy item id 
itemRouter.get("/get-by-id/:itemId",isAuth,getItemById)

export default itemRouter