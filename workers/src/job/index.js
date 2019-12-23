const { ObjectId } = require('mongodb');

const states = {
    NOT_STARTED: 'NOT_STARTED',
    STARTED: 'STARTED',
    FINISHED: 'FINISHED'
};

function startJob(db, id) {
    const collection = db.collection('jobs');

    return collection.findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: { state: states.STARTED } },
        { returnOriginal: false }
    );
}

function finishJob(db, id, fileKey) {
    const collection = db.collection('jobs');

    return collection.findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: { state: states.FINISHED, fileKey } },
        { returnOriginal: false }
    );
}


module.exports = { startJob, finishJob, states };