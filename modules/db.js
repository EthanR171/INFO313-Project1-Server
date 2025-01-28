import { MongoClient, ServerApiVersion } from 'mongodb';

const initDatabase = async (vars) => {
  const { DB_USER, DB_PASSWORD, DB_ADDRESS, DB_CLUSTER } = vars;
  const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_ADDRESS}/?appName=${DB_CLUSTER}`;
  let client = null;
  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await client.connect();
    console.warn(`Connected to the ${DB_CLUSTER} cluster`);
    return client;
  } catch (e) {
    console.error(`${e}`);
  }
};

const insertDocument = (client, database, collection, document) => {
  return client.db(database).collection(collection).insertOne(document);
};

const insertDocuments = (client, database, collection, documentArray) => {
  return client.db(database).collection(collection).insertMany(documentArray);
};

const deleteDocument = (client, database, collection, document) => {
  return client.db(database).collection(collection).deleteOne(document);
};

const deleteCollection = (client, database, collection) => {
  return client.db(database).collection(collection).drop();
};

const deleteDatabase = (client, database) => {
  return client.db(database).dropDatabase();
};

const findDocument = (
  client,
  database,
  collection,
  criteria,
  projection = { _id: 0 }
) => {
  return client
    .db(database)
    .collection(collection)
    .findOne(criteria, { projection });
};

const findDocuments = (
  client,
  database,
  collection,
  criteria,
  projection = { _id: 0 }
) => {
  return client
    .db(database)
    .collection(collection)
    .find(criteria, { projection })
    .toArray();
};

export {
  initDatabase,
  insertDocument,
  insertDocuments,
  deleteDocument,
  deleteCollection,
  deleteDatabase,
  findDocument,
  findDocuments,
};
