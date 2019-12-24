require('dotenv').config({ path: '../.env' });
const cluster = require('cluster');

const worker = require('./src/worker');
const logger = require('./src/logger');

if (cluster.isMaster) {
    masterProcess();
} else {
    childProcess();
}

logger.info('Process started');

function masterProcess() {
    const numCPUs = require('os').cpus().length;
    for (let i = 0; i < numCPUs; i++) {
        logger.info(`Forking process number ${i}...`);
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        logger.warn(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    });
}

function childProcess() {
    worker.run();
}