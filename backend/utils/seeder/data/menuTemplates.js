/**
 * menuTemplates.js
 * 
 * Mapping Logic:
 * Cuisine (Key) -> Defines the types of items and restaurant names.
 * Category (Field) -> Strictly matches the Item.model.js Enum.
 */

export const menuTemplates = {
    "North Indian": {
        category: "North Indian",
        items: [
            { name: "Paneer Butter Masala", priceRange: [220, 350], foodType: "veg" },
            { name: "Chicken Tikka Masala", priceRange: [280, 450], foodType: "non veg" },
            { name: "Dal Makhani", priceRange: [180, 280], foodType: "veg" }
        ]
    },
    "Chinese": {
        category: "Chinese",
        items: [
            { name: "Veg Hakka Noodles", priceRange: [150, 250], foodType: "veg" },
            { name: "Chicken Manchurian", priceRange: [220, 320], foodType: "non veg" },
            { name: "Schezwan Fried Rice", priceRange: [160, 260], foodType: "veg" }
        ]
    },
    "Biryani": {
        category: "Biryani",
        items: [
            { name: "Hyderabadi Chicken Biryani", priceRange: [250, 400], foodType: "non veg" },
            { name: "Veg Dum Biryani", priceRange: [200, 320], foodType: "veg" },
            { name: "Mutton Dum Biryani", priceRange: [350, 550], foodType: "non veg" }
        ]
    },
    "Thali": {
        category: "Thali",
        items: [
            { name: "Special Veg Thali", priceRange: [250, 450], foodType: "veg" },
            { name: "Maharashtrian Puran Poli Thali", priceRange: [280, 400], foodType: "veg" }
        ]
    },
    "Pizza": {
        category: "Pizza",
        items: [
            { name: "Margherita Pizza", priceRange: [200, 350], foodType: "veg" },
            { name: "Chicken Dominator", priceRange: [350, 550], foodType: "non veg" }
        ]
    },
    "Burgers": {
        category: "Burgers",
        items: [
            { name: "Aloo Tikki Burger", priceRange: [60, 120], foodType: "veg" },
            { name: "Chicken Zinger Burger", priceRange: [150, 240], foodType: "non veg" }
        ]
    },
    "Fast Food": {
        category: "Fast Food",
        items: [
            { name: "Vada Pav", priceRange: [20, 40], foodType: "veg" },
            { name: "Pav Bhaji", priceRange: [100, 180], foodType: "veg" },
            { name: "Misal Pav", priceRange: [80, 140], foodType: "veg" }
        ]
    },
    "Snacks": {
        category: "Snacks",
        items: [
            { name: "Samosa (2 pcs)", priceRange: [30, 50], foodType: "veg" },
            { name: "Onion Bhaji", priceRange: [60, 100], foodType: "veg" }
        ]
    },
    "Seafood": {
        category: "Main Course", // Mapping Seafood cuisine to Main Course category
        items: [
            { name: "Pomfret Fry", priceRange: [350, 550], foodType: "non veg" },
            { name: "Surmai Rava Fry", priceRange: [300, 450], foodType: "non veg" },
            { name: "Fish Curry", priceRange: [250, 380], foodType: "non veg" }
        ]
    },
    "Cafes": {
        category: "Beverages", // Mapping Cafe cuisine to Beverages category
        items: [
            { name: "Cappuccino", priceRange: [120, 200], foodType: "veg" },
            { name: "Cold Coffee", priceRange: [100, 180], foodType: "veg" },
            { name: "Cheese Sandwich", priceRange: [120, 220], foodType: "veg" }
        ]
    },
    "Sandwiches": {
        category: "Sandwiches",
        items: [
            { name: "Veg Club Sandwich", priceRange: [120, 200], foodType: "veg" },
            { name: "Chicken Mayo Sandwich", priceRange: [150, 250], foodType: "non veg" }
        ]
    }
};

export const restaurantNames = {
    "North Indian": ["The Grand Curry", "Pind Balluchi", "Sher-E-Punjab", "Spice Route", "Khyber", "Moti Mahal"],
    "Chinese": ["Dragon Wok", "Mainland China", "Uncle Wong's", "The Red Lantern", "Bamboo Shoots", "Wok Hei"],
    "Biryani": ["Paradise Biryani", "Behrouz Biryani", "Biryani By Kilo", "Lucky Restaurant", "Al-Hana", "Dawat-e-Ishq"],
    "Thali": ["Purohit Thali", "Rajdhani Thali", "Sukanta", "Aaswad", "Rama Nayak", "Thali Junction"],
    "Pizza": ["Pizza Express", "The Oven Story", "Eagle Boys Pizza", "Joey's Pizza", "Le Pizza", "La Pino'z"],
    "Burgers": ["Burger King", "Wat-A-Burger", "The Burger Club", "Fat Burger", "Smokin' Burgers"],
    "Fast Food": ["Street Bites", "Chai Point", "The Rollery", "Goli Vada Pav", "Jumbo King"],
    "Cafes": ["The Coffee House", "Blue Tokai", "Third Wave", "Cafe Coffee Day", "The Reading Room"],
    "Seafood": ["Gajalee", "Mahesh Lunch Home", "Trishna", "Fresh Catch", "Highway Gomantak"],
    "Snacks": ["Haldiram's", "Bikanervala", "Chitale Bandhu", "Gaurav Snacks", "Tiwari Bros"],
    "Sandwiches": ["Sandwich Express", "The Bread Box", "Subway Stories", "Toasties", "The Melt"]
};
