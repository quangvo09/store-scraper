var gplay = require('google-play-scraper');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/store-scraper";

let currentPage = 0;
const ITEMS_PER_PAGE = 100;
const MAX_PAGE = 6;
const DELAY = 5000;

const BASE_OPTIONS = {
  category: gplay.category.EDUCATION,
  collection: gplay.collection.TOP_FREE,
  lang: 'vi',
  country: 'vn',
  start: 1,
  num: 1
};

const collections = [
  gplay.collection.TOP_FREE,
  gplay.collection.TOP_PAID,
  gplay.collection.NEW_FREE,
  gplay.collection.NEW_PAID,
  gplay.collection.GROSSING,
  gplay.collection.TRENDING
]

async function main() {
  for (let i = 0; i <= collections.length; i++) {
    for (let j = 1; j <= MAX_PAGE; j++) {
      const start = (j - 1) * ITEMS_PER_PAGE;
      const num = ITEMS_PER_PAGE;
      await crawl(start, num, collections[i]);
      await crawlDelay();
    } 
  } 
}

async function crawl(start, num, collection) {
  const options = Object.assign({}, BASE_OPTIONS, {
    start, num, collection
  });

  const list = await gplay.list(options)

  // if (!list || list.length < 1) return Promise.resolve();

  // const result = await Promise.all(list.map(async app => {
  //   await crawlAppDetailDelay();
  //   const appDetail = await crawlAppDetail(app.appId);
  //   return appDetail;
  // }))

  return save(list);
}

async function save(list) {
  if (!list || list.length < 1) return Promise.resolve();

  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) return reject(err);
      var dbo = db.db("store-scraper");
      dbo.collection("educations").insertMany(list, function(err, res) {
        if (err) throw reject(err);
        console.log("Number of documents inserted: " + res.insertedCount);
        db.close();
        return resolve();
      })
    });
  })
}

function crawlDelay() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), DELAY);
  });
}

function crawlAppDetail(appId) {
  return gplay.app({appId});
}

function crawlAppDetailDelay() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 1000);
  });
}

main();
// gplay.list({
//   category: gplay.category.EDUCATION,
//   collection: gplay.collection.TOP_FREE,
//   lang: 'vi',
//   country: 'vn',
//   start: 100,
//   num: 10
// })
// .then(console.log, console.log);