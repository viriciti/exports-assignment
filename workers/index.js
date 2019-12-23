const cluster = require('cluster');
const worker = require('./src/worker');

if (cluster.isMaster) {
    masterProcess();
} else {
    childProcess();
}

function masterProcess() {
    console.log(`Master ${process.pid} is running`);

    const numCPUs = require('os').cpus().length;
    for (let i = 0; i < 1; i++) {
        console.log(`Forking process number ${i}...`);
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
    });
}

function childProcess() {
    console.log(`Worker ${process.pid} started`);
    worker.run();
}