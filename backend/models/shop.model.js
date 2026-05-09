import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }],
    categories: [{
        type: String
    }],
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    isVerified: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

shopSchema.pre('save', function (next) {
    if (!this.location) {
        this.location = { type: 'Point', coordinates: [0, 0] };
    }
    if (!this.location.coordinates || this.location.coordinates.length !== 2) {
        this.location.coordinates = [0, 0];
    }
    next();
});

shopSchema.index({ location: '2dsphere' })

const Shop = mongoose.model("Shop", shopSchema)
export default Shop