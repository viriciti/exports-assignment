const unwind = require('./unwind');

const collections = [
    'speed',
    'soc',
    'current',
    'odo',
    'voltage',
];

function collectionUnwind(collection, start, end) {
    const stream = unwind(collection, start, end);
    const data = [];
    return new Promise(function (resolve, reject) {
        stream.on('data', function (chunk) {
            data.push(`${chunk.time},${chunk.value}`);
        });
        stream.on('end', () => resolve(data));
        stream.on("error", error => reject(error));
    })
}

async function allCollections(db, start, end) {
    const allCollections = collections.map((collection) => {
        const dbCollection = db.collection(collection);
        return collectionUnwind(dbCollection, start, end)
            .then((data) => {
                data.unshift(`time,${collection}`);
                return data;
            });
    });

    const [ speed, soc, current, odo, voltage ] = await Promise.all(allCollections);
    return [ ...speed, ...soc, ...current, ...odo, ...voltage].join('\n');

}

module.exports = allCollections;