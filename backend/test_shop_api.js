import axios from 'axios';

async function test() {
    try {
        // Authenticate as a user first if needed, or if route is open
        const result = await axios.get('http://localhost:5000/api/shop/get-by-city/Delhi');
        console.log("Shops length:", result.data.length);
        if (result.data.length > 0) {
            console.log("Categories of first shop:", result.data[0].categories);
            console.log("Type of categories:", typeof result.data[0].categories);
            console.log("Is array?", Array.isArray(result.data[0].categories));
        }
    } catch (e) {
        console.log("Error:", e.response?.data || e.message);
    }
}
test();
