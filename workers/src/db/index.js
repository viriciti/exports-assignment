const { MongoClient } = require('mongodb');

async function getDbs () {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const connection = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    const adminDb = connection.db('admin').admin();
    const allDatabases = await adminDb.listDatabases();

    const vehicleDatabases = allDatabases.databases
        .filter((db) => db.name.startsWith('vehicle'))
        .map((db) => connection.db(db.name));

    const exportsDatabase = connection.db(allDatabases.databases.find(db => db.name === 'exports').name);

    return { vehicleDatabases, exportsDatabase };
}

module.exports = { getDbs };