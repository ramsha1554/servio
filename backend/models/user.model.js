import mongoose from "mongoose";

const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, // not used the required because of google login
    },
    mobile: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "owner", "deliveryBoy", "admin"],
        required: true
    },
    resetOtp: {
        type: String
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    otpExpires: {
        type: Date
    },
    socketId: {
        type: String,

    },
    isOnline: {
        type: Boolean,
        default: false
    },
    location: {
        type: pointSchema,
        default: undefined
    },
    deviceToken: {
        type: String // For push notifications
    },
    addresses: [{
        street: String,
        city: String,
        state: String,
        zipCode: String,
        isDefault: { type: Boolean, default: false }
    }],
    isBanned: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

// Use a sparse index so documents without location are not indexed
// The index is now defined directly on the field above with the 'sparse' behavior handled by 'default: undefined'
// userSchema.index({ location: "2dsphere" }, { sparse: true });


const User = mongoose.model("User", userSchema)
export default User