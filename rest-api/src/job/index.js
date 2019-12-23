const { ObjectId } = require('mongodb');

const states = {
    NOT_STARTED: 'NOT_STARTED',
    STARTED: 'STARTED',
    FINISHED: 'FINISHED'
};

function getJob(db, id) {
    const collection = db.collection('jobs');

    return collection.findOne({ _id: ObjectId(id) });
}

async function createJob(db, startDate, endDate) {
    const collection = db.collection('jobs');

    const aJob = await collection.insertOne({ startDate, endDate, state: states.NOT_STARTED });
    return aJob.insertedId;
}


module.exports = { getJob, createJob };