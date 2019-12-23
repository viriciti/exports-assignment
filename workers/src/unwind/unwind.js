/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _             = require("underscore");
const { Transform } = require("stream");

/*
Example of database document structure

{
  "_id" : 1482246000000.0,
  "levels" : [ 3600000, 300000, 60000, 10000 ],
  "values" : {
    "0" : {
      "values" : {
        "0" : {
          "values" : {
            "0" : {
              "values" : {
                "5312" : 1126487,
                "5411" : 1126586,
                "6412" : 1127587,
                "7511" : 1128686,
                "8513" : 1129688,
                "9614" : 1130789
              }
            },
            "10000" : {
              "values" : {
                "714" : 1131889,
                "1812" : 1132787
              }
            }
          }
        }
      }
    }
}
*/

/*
This function will flatten the document from the parameter collection into a timeseries array. It's weird!

@params document, Object, An object document from the parameter collection
*/
const unwindDocument = function(document) {
    var unwindLevel = function(level, time, currentDepth) {
        const subLevels = _.sortBy(_.map((_.keys(level.values)), Number));
        if (subLevels.length && level.values[subLevels[0]].values) {
            return _.map(subLevels, subLevel => unwindLevel(level.values[subLevel], time + subLevel, currentDepth + 1));
        } else {
            return _.sortBy((_.map(level.values, (value, subtime) => ({
                time: time + +subtime,
                value
            }))), (value, key) => key);
        }
    };

    return _.flatten(unwindLevel(document, +document._id, 0));
};

/*
@param database, MongoDB Collection, The parameter collection to query
@param label,    String,             The name of the paramter collection to query
@param start,    unix timestamp,     The start time in milliscends
@param end,      unix timestamp,     The end time in milliseconds
*/
module.exports = function(collection, start, end){
    const query = {
        _id: {
            $gte: start - (start % 3600000),
            $lt:  end
        }
    };

    const source = collection
        .find(query)
        .batchSize(24)
        .sort({_id: 1})
        .stream();

    const unwind = new Transform({
        objectMode: true,
        transform(doc, enc, cb) {
            for (let point of Array.from(unwindDocument(doc))) { this.push(point); }
            return cb();
        }
    });

    const reduce = new Transform({
        objectMode: true,
        transform(point, enc, cb) {
            if (point.time < start) { return cb(); }
            if (point.time > end) { return cb(); }
            return cb(null, point);
        }
    });

    return source
        .pipe(unwind)
        .pipe(reduce);
};