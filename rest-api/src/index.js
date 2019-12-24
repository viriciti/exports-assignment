const db = require('./db');
const job = require('./job');
const fileHosting = require('./fileHosting');
const queue = require('./queue');

async function getExport (id) {
    const exportDb = await db.getDb();
    const aJob = await job.getJob(exportDb, id);

    if (aJob.fileKey) {
        aJob.fileKey = await fileHosting.getTempLink(aJob.fileKey);
    }

    return aJob;
}

async function createExport ({ startDate, endDate }) {
    const exportDb = await db.getDb();
    const aJobId = await job.createJob(exportDb, startDate, endDate);

    await queue.sendJob(aJobId.toString());
    return aJobId;
}

module.exports = { getExport, createExport };