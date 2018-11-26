var gplay = require('google-play-scraper');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/store-scraper";
const ObjectId = require('bson').ObjectID;


function loadDocument() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) return reject(err);
      var dbo = db.db("store-scraper");
      dbo.collection("educations_detail").findOne({ 'minInstalls': { '$exists':  false }}, function(err, result) {
        if (err) reject(err);
        db.close();
        
        return resolve(result);
      })
    });
  })
}

function crawlAppDetail(appId) {
  return gplay.app({appId});
}

function updateAppDetail(appId, appDetail) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) return reject(err);
      var dbo = db.db("store-scraper");
      var query = { appId };
      console.log(query)
      dbo.collection("educations-detail").replaceOne({ "_id": ObjectId("5bfbd45afd7ff07faa8c6a21") }, appDetail, function(err, result) {
        // db.close();
        if (err) return reject(err);
        
        console.log(result)
        return resolve();
      })
    });
  })
}

function crawlAppDetailDelay() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 1000);
  });
}

async function main() {
  for (let i = 0; i < 100; i++) {
    let app = await loadDocument();
    const appId = app.appId;
    const appDetail = await crawlAppDetail(appId);
    await updateAppDetail(appId, appDetail);
    await crawlAppDetailDelay();
  }
}


main()
.then(() => console.log("ok"));