_               = require "underscore"
{ EJSON }       = require "bson"
{ MongoClient } = require "mongodb"
{ pipeline }    = require "stream"
{ Writable }    = require "stream"
assert          = require "assert"
async           = require "async"
fs              = require "fs"

unwindStream = require "../src/lib/unwind"

config =
	db:
		host: "localhost"
		port: 27017
		name: "test_unwind"

describe "unwind", ->
	before (done) ->
		@timeout 10000

		async.series [
			(cb) =>
				MongoClient.connect "mongodb://#{config.db.host}:#{config.db.port}/test", { useUnifiedTopology: true }, (error, @client) =>
					return cb error if error
					cb()

			(cb) =>
				@client
					.db config.db.name
					.collection "speed"
					.deleteMany {}, cb

			(cb) =>
				ejson = fs
					.readFileSync "./meta/test-data/vehicle_001_speed.json"
					.toString()

				@client
					.db config.db.name
					.collection "speed"
					.insertMany (EJSON.parse ejson), cb
		], done

	after (done) ->
		@timeout 10000

		async.series [
			(cb) =>
				@client
					.db config.db.name
					.collection "speed"
					.deleteMany {}, cb

			(cb) =>
				@client
					.db config.db.name
					.dropDatabase config.db.name, cb

			(cb) =>
				@client.close false, cb
		], done

	it "should transform the stored document model and stream in a time-series format", (done) ->
		collection = @client
			.db config.db.name
			.collection "speed"

		source = unwindStream collection, (+new Date "2019-10-01"), (+new Date "2019-12-01")

		sink = new Writable
			objectMode: true
			write: (point, enc, cb) ->
				@prev  or= time: 0, value: 0
				@count or= 1
				@count++
				assert point.time
				assert point.value?
				assert point.time > @prev.time
				@prev = point
				cb()

		pipeline [
			source
			sink
		], (error) ->
			return done error if error

			assert.equal sink.count, 37276
			assert.equal sink.prev.time, 1572618753018
			assert.equal sink.prev.value, 0

			done()
