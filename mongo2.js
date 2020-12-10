const debug = require('debug')('app:db');
const config = require('config');
const { MongoClient, ObjectID } = require('mongodb');

let _database = null;

const connect = async () => {
  if (!_database) {
    const dbUrl = config.get('db.url');
    const dbName = config.get('db.name');
    const poolSize = config.get('db.poolSize');
    const client = await MongoClient.connect(dbUrl, { useUnifiedTopology: true, poolSize: poolSize });
    _database = client.db(dbName);
  }
  return database;
};
