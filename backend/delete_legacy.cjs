const m = require('mongoose');
m.connect(require('dotenv').config().parsed.MONGODB_URL).then(async () => {
    const shopIds = [
        new m.Types.ObjectId("695e35c5dbc9f353155045eb"),
        new m.Types.ObjectId("69fb1f8607f583a1f7460723"),
        new m.Types.ObjectId("69fb24fdb7c92787e275f8d3")
    ];

    const delItems = await m.connection.db.collection('items').deleteMany({ shop: { $in: shopIds } });
    const delShops = await m.connection.db.collection('shops').deleteMany({ _id: { $in: shopIds } });

    console.log("Deleted shops:", delShops.deletedCount);
    console.log("Deleted items:", delItems.deletedCount);

    const legacyShopCount = await m.connection.db.collection('shops').countDocuments({ "location.coordinates": [0,0] });
    console.log("Remaining [0,0] shops:", legacyShopCount);

    const orphanedItemsCount = await m.connection.db.collection('items').countDocuments({ shop: { $in: shopIds } });
    console.log("Remaining orphaned items:", orphanedItemsCount);

    process.exit(0);
});
