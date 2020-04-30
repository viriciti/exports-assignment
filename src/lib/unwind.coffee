_             = require "underscore"
{ Transform } = require "stream"

###
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
###

###
This function will flatten a document into a timeseries array. It's weird!

@params document, Object, An object document from the parameter collection
###
unwindDocument = (document) ->
	unwindLevel = (level, time, currentDepth) ->
		subLevels = _.sortBy _.map (_.keys level.values), Number
		if subLevels.length and level.values[subLevels[0]].values
			_.map subLevels, (subLevel) -> unwindLevel level.values[subLevel], time + subLevel, currentDepth + 1
		else
			_.sortBy (_.map level.values, (value, subtime) -> time: time + +subtime, value: value), (value, key) -> key

	_.flatten unwindLevel document, +document._id, 0

###
This function returns a consumable stream of datapoints from a selected MongoDB collection holding vehicle paramter data.

@param database, MongoDB Collection, The parameter collection to query
@param label,    String,             The name of the paramter collection to query
@param start,    unix timestamp,     The start time in milliscends
@param end,      unix timestamp,     The end time in milliseconds

Example usage (working code):

```
{ MongoClient } = require "mongodb"

unwind = require "./src/lib/unwind"

start = +new Date "2018-01-03T00:00:00.000Z"
end   = +new Date "2018-01-04T00:00:00.000Z"

do ->
  client = await MongoClient.connect "mongodb://localhost:27017/vehicle_001", { useUnifiedTopology: true }

  speed = client
    .db "vehicle_001"
    .collection "speed"

  source = unwind speed, start, end
  source.on "data", (point) -> console.log "Speed data point!", point
  source.on "end",          -> console.log "Source is fully drained!"
```
###
module.exports = (collection, start, end)->
	query =
		_id:
			$gte: start - start % 3600000
			$lt:  end

	source = collection
		.find      query
		.batchSize 24
		.sort      _id: 1
		.stream()

	unwind = new Transform
		objectMode: true
		transform: (doc, enc, cb) ->
			@push point for point in unwindDocument doc
			cb()

	reduce = new Transform
		objectMode: true
		transform: (point, enc, cb) ->
			return cb() if point.time < start
			return cb() if point.time > end
			cb null, point

	source
		.pipe unwind
		.pipe reduce
