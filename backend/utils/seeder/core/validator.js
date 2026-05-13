import { z } from 'zod';

const CATEGORIES = [
    "Snacks", "Main Course", "Desserts", "Pizza", "Burgers", 
    "Sandwiches", "South Indian", "North Indian", "Chinese", 
    "Fast Food", "Biryani", "Thali", "Beverages", "Sweets", "Others"
];

const FOOD_TYPES = ["veg", "non veg"];

export const shopSchema = z.object({
    name: z.string().min(3).max(100),
    city: z.string().min(2),
    state: z.string().min(2),
    address: z.string().min(5),
    categories: z.array(z.string()).min(1),
    location: z.object({
        type: z.literal('Point'),
        coordinates: z.array(z.number()).length(2)
    })
});

export const itemSchema = z.object({
    name: z.string().min(2),
    category: z.enum(CATEGORIES),
    price: z.number().min(0),
    foodType: z.enum(FOOD_TYPES),
    image: z.string().url().optional()
});

export const ownerSchema = z.object({
    fullName: z.string().min(3),
    email: z.string().email(),
    mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
    role: z.literal('owner')
});

export const validateData = (schema, data) => {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new Error(`Validation Error: ${JSON.stringify(result.error.format())}`);
    }
    return result.data;
};
