const cluster = require('cluster');
const bunyan = require('bunyan');

module.exports = bunyan.createLogger({
    name: 'workers',
    isMaster: cluster.isMaster,
    processPid: process.pid
});