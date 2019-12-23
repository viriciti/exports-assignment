const { MongoClient } = require('mongodb');

async function getDb () {
    const uri = process.env.MONGO_URI;
    const connection = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    return connection.db('exports');
}

module.exports = { getDb };