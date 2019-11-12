

# Exports Assignment
![](https://imgs.xkcd.com/comics/data_pipeline.png)

## Introduction
This repository holds the ViriCiti Exports assignment, where you will create a salable export tool. The export functionality that you will create for us addresses a MongoDB database and extracts vehicle parameters and combines this into a zipped CSV format. Together with this assignment, you should have been given access to a vehicle data set to work with, with which you can provision your local database.

## Database model structure
First of all, every vehicle will have its own database on the MongoDB server.
```
DB
 |
 + ── vehicle_001
 + ── vehicle_002
 - ── vehicle_003
     ├── speed
     ├── voltage
     ├── soc
     ├── odo
     └── current
```
Then, every parameter (e.g. SoC (state of charge), speed, etc.) has its own collection. In this collection, the documents that hold all time-series data are formatted into nested objects of multiple levels, where at the lowest level, all time-value data within that hour is stored. These kinds of formatted documents reside in the dataset given to you. An example of such a document:
###
```
{
  "_id" : 1482246000000,
  "levels" : [ 3600000, 300000, 60000, 10000 ],
  "values" : {
    "0" : {
      "values" : {
        "0" : {
          "values" : {
            "0" : {
              "values" : {
                "5312" : 1126487, // actual data point
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
```
Where,
* `_id`: this is the document index and unix timestamp representation of the hour of this document
* `levels`: this array indicates the time segmentation made, resulting in each level and tree structure for all data points within this hour. In this case:
	* `3600000`: this is the document main level in milliseconds (3600000 ms equals to one hour)
	* `300000`:  this equals 5 minutes, meaning all parameter data is segmented into a first level every five minutes within the hour
	* `60000`:  the next nested level is composed of minutes
	* `10000`: this is the final level in which the actual time-value pair is stored on ms level
* `values`: this attribute contains the complete tree of data-point in accordance with the document’s structure indicated by the `levels` array

## Utility
Within this repository the "unwind" function (in `src/lib/unwind.coffee`) helps you to extract the nested documents and unwind it to a regular chronologically ordered time-series stream of data points. You will need to give this function (1) a MongoDB collection (representing a single parameter collection of a particular vehicle), (2) a start time as unix timestamp, and (3) an end time as unix timestamp. The function returns a stream that you can pipe to any other transform or writable. See the `test/unwind_test.coffee` for an example of this. It is all written in CoffeeScript, but you can, of course, rewrite this easily to vanilla JavaScript.

## The problem
The main challenge is creating an export system that will not overflow the database system when a lot of export requests are issued.

### Functional requirements
* The export functionality should be able to create a zipped collection of CSV files holding the time-series data. Each CSV file represents the extracted data of a single vehicle for the given period, where every column represents the chosen vehicle parameters. The listed parameter values in each column should all align (and be chronologically ordered) along with a single column representing time. This will very probably result in a sparse matrix of all values, as shown in this example:
  ```
  time            soc  speed current      odo  voltage
  1572562812345  23.1   45.2                       602
  1572562812365                  27                   
  1572562812387                                    603
  1572562812391  23.0            26   14234.2         
  1572562812404         45.1                       598
  ```
  _(For clearity purposes this example in not a CSV format)_

* The exports should be throttled. Basically, the enormous loads per export request should be controlled, and should not overflow the framework you will create.
* (Bonus) Create a simple UI where the exports can be composed, and the export result can be downloaded.

The most important task for this assignment is to think out and present to us an architecture, which can be composed of specific microservices, queue systems, API endpoints, databases, and gateways. In terms of code, a Proof of Concept is required.

## Questions
If you have any questions about the assignment, the project setup or you're simply stuck, feel free to contact us at <a href='mailto:s.surur@viriciti.com'>s.surur@viriciti.com</a> or <a href='mailto:s.rijk@viriciti.com'>s.rijk@viriciti.com</a>. Please do not hesitate for this! You are also more than welcome to come by at the office at any time. We're always ready to help. The idea is that something is created that you learn from and in the end can be proud of.

## Disclaimer
As this assignment is just created, we might need to assist you further with more data sets or provide you with more insights. It could be that we have completely underestimated the workload of this assignment. In that case, you can always go for [this development assignment](https://github.com/viriciti/nodejs-assignment)!

## Presentation
Finally, when you are done, you will present your process, technical architecture and outcome to us. Looking forward to it!

Good luck with the assignment!
