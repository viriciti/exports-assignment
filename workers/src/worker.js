const zip = require("node-native-zip");

const db = require('./db');
const queue = require('./queue');
const fileHosting = require('./fileHosting');
const unwind = require('./unwind');
const job = require('./job');


// const start = new Date("2018-11-30").valueOf();
// const end = new Date("2018-12-01").valueOf();

async function task ({ vehicleDatabases, exportsDatabase }, id) {
    console.log(`Gonna start task for ${id}`);
    const { value: newJob } = await job.startJob(exportsDatabase, id);

    console.log(`Retrieving information from ${newJob.startDate} (${newJob.startDate.valueOf()}) to ${newJob.endDate} (${newJob.endDate.valueOf()})`);
    const promises = vehicleDatabases.map(db => unwind(db, newJob.startDate.valueOf(), newJob.endDate.valueOf()));
    const contents = await Promise.all(promises);
    console.log('Got all information from DB');

    const archive = new zip();
    for (let i = 0; i < contents.length; i++) {
        archive.add(`${vehicleDatabases[i].databaseName}.csv`, Buffer.from(contents[i]));
    }
    const zipBuffer = archive.toBuffer();
    console.log('Zipped files');

    const zipFileName = `export-${newJob._id}.zip`;
    await fileHosting.uploadFile(zipFileName, zipBuffer);
    console.log('Uploaded Zip file');

    await job.finishJob(exportsDatabase, newJob._id, zipFileName);
}

async function run () {
    try {
        const dbs = await db.getDbs();
        await queue.listenToQueue(task.bind(null, dbs));
        // await task(dbs, '5dfebecc97849bac3a1f34e0'); // testing purposes
    } catch (err) {
        console.error(err);
    }
}

module.exports = { run };
