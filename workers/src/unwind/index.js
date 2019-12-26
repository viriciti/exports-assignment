const { Transform } = require("stream");
const unwind = require('./unwind');
const collectionsNames = [
    'speed',
    'soc',
    'current',
    'odo',
    'voltage',
];

function allCollectionsAsStream(db, start, end) {
    return collectionsNames.map((collectionName) => {
        const dbCollection = db.collection(collectionName);

        const stringify = new Transform({
            objectMode: true,
            transform(point, enc, cb) {
                const string = `${point.time},${point.value}\n`;
                return cb(null, string);
            }
        });
        return { collectionName, stream: unwind(dbCollection, start, end).pipe(stringify) };
    });
}

module.exports = allCollectionsAsStream;