require('dotenv').config();
const mongoose = require('mongoose');
const connection = mongoose.connection;
const ObjectId = require('mongodb').ObjectId;

mongoose.connect(process.env.DATABASE, {useNewUrlParser: true});
mongoose.Promise = global.Promise;

var map = function() {
  var key = this.author;
  var words = this.content.split(' ');
  // Remove non alpha chars
  words = words.map((word) => {
    return word.replace(/[^0-9a-z]/gi, '').toLowerCase();
  })
  // Remove empty
  words = words.filter((word) => {
    return word !== '';
  })
  var wordCount = words.reduce((count, word) => {
    count[word] = count.hasOwnProperty(word) ? count[word] + 1 : 1;
    return count;
  }, {});

  emit(key, wordCount);
}

var reduce = function(key, values) {

  var reducedObj = values.reduce((result, currentObj) => {
    for(var key in currentObj) {
      if(result.hasOwnProperty(key)){
        result[key] += currentObj[key];
      }
      else {
        result[key] = currentObj[key];
      }
    }
    return result;
  }, {});

  return reducedObj;
}

var finalize = function(key, reducedObj) {
  //Make array of objects
  var wordsArray = Object.keys(reducedObj).map((key) => {
    var obj = {
      word: key,
      count: reducedObj[key]
    }
    return obj;
  });
  //Sort array based on count
  wordsArray = wordsArray.sort((a,b) => (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0));
  //Pick the top 10 items
  wordsArray = wordsArray.slice(0,10);

  return wordsArray;
}

mongoose.connection
  .on('connected', () => {
    console.log(`Mongoose connection open on ${process.env.DATABASE}`);
    connection.db.collection('article_subset', (err, collection) => {
      if(err) throw err;

      collection.mapReduce(map, reduce, {out: 'word_count', finalize: finalize}).then(() => {
        console.log("M/R finished");
      })

    })
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  })
