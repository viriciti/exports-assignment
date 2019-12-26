const compressing = require('compressing');
const zlib = require('zlib');

const db = require('./db');
const queue = require('./queue');
const fileHosting = require('./fileHosting');
const unwind = require('./unwind');
const job = require('./job');
const logger = require('./logger');

// const start = new Date("2018-11-30").valueOf();
// const end = new Date("2018-12-01").valueOf();

async function task ({ vehicleDatabases, exportsDatabase }, id) {
    logger.info(`Gonna start task for ${id}`);
    const { value: newJob } = await job.startJob(exportsDatabase, id);

    logger.debug(`Retrieving information from ${newJob.startDate} to ${newJob.endDate}}`, {
        startDate: newJob.startDate.valueOf(),
        endDate: newJob.endDate.valueOf()
    });
    const databasesOutput = vehicleDatabases.map(db => unwind(db, newJob.startDate.valueOf(), newJob.endDate.valueOf()));
    logger.debug('Got all streams');

    const tar = new compressing.tar.Stream();
    databasesOutput.forEach((databaseOutput, index) => {
        databaseOutput.forEach(({ collectionName, stream }) => {
            const fileName = `${collectionName}.csv`;
            tar.addEntry(stream,
            { suppressSizeWarning: true, relativePath: `${vehicleDatabases[index].databaseName}/${fileName}` }
            );
        });
    });
    logger.debug('Zipped files');

    const archive = tar.pipe(zlib.createGzip());
    const archiveFileName = `export-${newJob._id}.tar.gz`;
    await fileHosting.uploadFile(archiveFileName, archive);
    logger.debug('Uploaded Zip file');

    archive.on('end', () => logger.debug('end archive'));

    await job.finishJob(exportsDatabase, newJob._id, archiveFileName);
    logger.info(`Finished task ${id}`)
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
