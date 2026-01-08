import { z } from "zod";

// User Schemas
export const UserSchema = {
    signUp: z.object({
        fullName: z.string().min(3, "Full name must be at least 3 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
        role: z.enum(["user", "owner", "deliveryBoy"], {
            errorMap: () => ({ message: "Role must be user, owner, or deliveryBoy" })
        })
    }),
    signIn: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required")
    }),
    updateProfile: z.object({
        fullName: z.string().min(3).optional(),
        email: z.string().email().optional(),
        mobile: z.string().min(10).optional()
    }),
    googleAuth: z.object({
        email: z.string().email(),
        fullName: z.string().optional(),
        mobile: z.string().optional(),
        role: z.enum(["user", "owner", "deliveryBoy"]).optional()
    }),
    sendOtp: z.object({
        email: z.string().email("Invalid email address")
    }),
    verifyOtp: z.object({
        email: z.string().email("Invalid email address"),
        otp: z.string().length(4, "OTP must be 4 digits")
    }),
    resetPassword: z.object({
        email: z.string().email("Invalid email address"),
        newPassword: z.string().min(6, "Password must be at least 6 characters")
    })
};

// Shop Schemas
export const ShopSchema = {
    createEdit: z.object({
        name: z.string().min(3, "Shop name is required"),
        city: z.string().min(2, "City is required"),
        state: z.string().min(2, "State is required"),
        address: z.string().min(5, "Address is required")
    })
};

// Item Schemas
export const ItemSchema = {
    addEdit: z.object({
        name: z.string().min(2, "Item name is required"),
        category: z.string().min(2, "Category is required"),
        foodType: z.string().min(2, "Food type (Veg/Non-Veg) is required"), // Could be enum if strict
        price: z.coerce.number().min(1, "Price must be greater than 0") // coerce handles string->number from form-data
    }),
    rating: z.object({
        itemId: z.string().min(1, "Item ID is required"),
        rating: z.number().min(1).max(5)
    })
};

// Order Schemas
export const OrderSchema = {
    placeOrder: z.object({
        cartItems: z.array(z.object({
            shop: z.string(),
            id: z.string(),
            price: z.number(), // or coerce.number() if needed
            quantity: z.number().min(1),
            name: z.string()
        })).min(1, "Cart cannot be empty"),
        paymentMethod: z.enum(["online", "cod"]),
        deliveryAddress: z.object({
            text: z.string().min(5, "Address text required"),
            latitude: z.number(),
            longitude: z.number()
        }),
        totalAmount: z.number().min(0)
    }),
    updateStatus: z.object({
        status: z.enum(["prepared", "out of delivery", "delivered", "cancelled", "preparing"], {
            errorMap: () => ({ message: "Invalid status" })
        })
    }),
    verifyPayment: z.object({
        razorpay_payment_id: z.string().min(1),
        orderId: z.string().min(1)
    }),
    otp: z.object({
        orderId: z.string().min(1),
        shopOrderId: z.string().min(1),
        otp: z.string().optional() // Optional because sendOtp doesn't submit it, verify does
    })
};
