import multer from "multer"
const storage=multer.diskStorage({
   destination:(req,file,cb)=>{
    cb(null,"./public")
   },
   filename:(req,file,cb)=>{
    cb(null, Date.now() + '-' + file.originalname)
   }
})

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false)
  }
}

export const upload=multer({storage, fileFilter})