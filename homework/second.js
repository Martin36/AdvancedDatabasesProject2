require('dotenv').config();
const mongoose = require('mongoose');
const connection = mongoose.connection;
const ObjectId = require('mongodb').ObjectId;

mongoose.connect('mongodb://localhost:27017/nmbp', {useNewUrlParser: true});
mongoose.Promise = global.Promise;

var map = function() {
  if(this.film.actors == null) return;
  this.film.actors.forEach((actor) => {
    var key = {
      actorFName: actor.first_name,
      actorLName: actor.last_name
    };
    var value = {
      films: [
        this.film.title
      ]
    };
    emit(key, value);
  })
}

var reduce = function(key, values) {
  var filmsArray = [];
  values.forEach((value) => {
    value.films.forEach((filmTitle) => {
      //Check if title already in filmsArray
      var index = filmsArray.indexOf(filmTitle);
      if(index < 0)
      filmsArray.push(filmTitle);
    })
  });
  var results = {
    films: filmsArray
  };
  return results;
}

var finalize = function(key, reducedObj) {
  reducedObj.films = reducedObj.films.sort((a,b) => (a > b) ? 1 : ((b > a) ? -1 : 0));
  return reducedObj;
}

mongoose.connection
  .on('connected', () => {
    console.log(`Mongoose connection open on mongodb://localhost:27017/nmbp`);

    connection.db.collection('dvdrent', (err, collection) => {
      if(err) throw err;

      var filter = {"film.rating": "R"};

      collection.mapReduce(map, reduce, { out: 'hw_second', query: filter, finalize: finalize }).then(() => {
        console.log("mapReduce finished!");
        mongoose.connection.close();
      })

    })
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });
