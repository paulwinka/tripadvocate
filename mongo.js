// const { MongoClient } = require('mongodb');
// const run = async () => {
//   try {
//     const dbUrl = 'mongodb://localhost:27017';
//     const dbName = 'cowboy_boots';
//     const client = await MongoClient.connect(dbUrl, { useUnifiedTopology: true });
//     const database = client.db(dbName);
//     const collection = database.collection('products');
//     const product = await collection.findOne({ name: 'red boots' });
//     console.log(product);
//   } catch (err) {
//     console.log(err);
//   }
// };
// run();
const { MongoClient } = require('mongodb');
const run = async () => {
  try {
    const dbUrl = 'mongodb+srv://paul_winka:5016pimlico@cluster0.ht4ef.mongodb.net/<dbname>?retryWrites=true&w=majority';
    const dbName = 'travel';
    const client = await MongoClient.connect(dbUrl, { useUnifiedTopology: true });
    const database = client.db(dbName);
    const collection = database.collection('user');
    const user = await collection.findOne({ username: 'admin' });
    console.log(user);
  } catch (err) {
    console.log(err);
  }
};
run();
