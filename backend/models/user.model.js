import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password:{
        type: String, // not used the required because of google login
    },
    mobile:{
        type: String,
        required: true, 
    },
    role:{
        type:String,
        enum:["user","owner","deliveryBoy","admin"],
        required:true
    },
    resetOtp:{
        type:String
    },
    isOtpVerified:{
        type:Boolean,
        default:false
    },
    otpExpires:{
        type:Date
    },
    socketId:{
     type:String,
     
    },
    isOnline:{
        type:Boolean,
        default:false
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    isBanned: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

userSchema.pre('save', function (next) {
    if (!this.location) {
        this.location = { type: 'Point', coordinates: [0, 0] };
    }
    if (!this.location.coordinates || this.location.coordinates.length !== 2) {
        this.location.coordinates = [0, 0];
    }
    next();
});

userSchema.index({ location: '2dsphere' })


const User=mongoose.model("User",userSchema)
export default User