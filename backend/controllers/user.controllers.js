import User from "../models/user.model.js"

export const getCurrentUser=async (req,res) => {
    try {
        const userId=req.userId
        if(!userId){
            return res.status(400).json({message:"userId is not found"})
        }
        const user=await User.findById(userId).select("-password")
        if(!user){
               return res.status(400).json({message:"user is not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`get current user error ${error}`})
    }
}

export const updateUserLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
        }

        // Validate coordinates (Lat: -90 to 90, Lng: -180 to 180)
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({ success: false, message: "Invalid coordinates provided" });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                location: {
                    type: "Point",
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                }
            },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Location updated successfully",
            user
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Update location error: ${error.message}` });
    }
}

