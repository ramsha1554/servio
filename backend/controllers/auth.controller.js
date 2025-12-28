import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


export const signUp=async(req,res)=>{
    try {
        const { fullName, email, password, mobile, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({   
                success: false,
                message: "User with this email already exists"
            });
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters long"
                });
            }
            if (!mobile.match(/^[0-9]{10}$/)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid mobile number format"
                });
            }   
        }



const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            fullName,
            email,
            password: hashPassword,
            mobile,
            role
        });


     
        await user.save();

          const token=await genToken(user._id)
        res.cookie("token",token,{
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000,
            httpOnly:true
        })


        res.status(201).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}



export const signIn=async(req,res)=>{
try { const {email, password} =req.body
   const user = User.findOne({email})

   if (!user)
     {
    return res.status(400).json({
                    success: false,
                    message: "User not found"
                });
   }


   const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch){
    res.status(400).json({
        success: false,
        message: "Invalid credentials"
    });
   }

     const token=await genToken(user._id)
        res.cookie("token",token,{
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000,
            httpOnly:true
        })


        res.status(201).json({
            success: true,
            user
        });



        return res.status(200).json({
  success: true,
            user})
    
} 
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
  

}


export const signOut = async (req,res) => {try {
    
res.clearCookie("token")
res.status(200).json({ success: true,
      message: "logout successfully"
})

} catch (error) {
      res.status(500).json({
            success: false,
            message: error.message
        });
}
    
}