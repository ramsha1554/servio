const m = require('mongoose');
m.connect(require('dotenv').config().parsed.MONGODB_URL).then(async () => {
    
    // 1. Confirm no [0,0] coordinates
    const zeroShops = await m.connection.db.collection('shops').countDocuments({ "location.coordinates": [0,0] });
    console.log("Shops with [0,0] coordinates:", zeroShops);

    // 2. Confirm no duplicate images
    const dupImages = await m.connection.db.collection('items').aggregate([
        { $group: { _id: "$image", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
    ]).toArray();
    console.log("Duplicate images count:", dupImages.length);
    if(dupImages.length > 0) console.log(dupImages);

    // 3. Confirm all categories match frontend
    const distinctCats = await m.connection.db.collection('items').distinct("category");
    console.log("Distinct categories in DB:", distinctCats);

    // 4. Confirm foodType logic
    const badChicken = await m.connection.db.collection('items').countDocuments({ name: /chicken/i, foodType: "veg" });
    console.log("Chicken items marked as veg:", badChicken);

    process.exit(0);
});
