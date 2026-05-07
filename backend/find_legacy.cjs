const m=require('mongoose');
m.connect(require('dotenv').config().parsed.MONGODB_URL).then(async ()=>{
  const shops = await m.connection.db.collection('shops').find({
    $or: [
      {'location.coordinates': [0,0]},
      {items: {$size: 0}},
      {items: {$exists: false}}
    ]
  }, {projection: {name:1, _id:1}}).toArray();
  console.log(JSON.stringify(shops, null, 2));
  process.exit(0);
});
