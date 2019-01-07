require('dotenv').config();
const mongoose = require('mongoose');
const connection = mongoose.connection;
const ObjectId = require('mongodb').ObjectId;

mongoose.connect('mongodb://localhost:27017/nmbp', {useNewUrlParser: true});
mongoose.Promise = global.Promise;

var map = function() {
  if(this.payment == null) return;
  var key = {
    staf: this.staff.first_name + " " + this.staff.last_name
  }
  var value = {
    films: [
      {
        film_title: this.film.title,
        amount: this.payment == null ? 0 : this.payment.amount
      }
    ]
  }

  emit(key, value);
}

var reduce = function(key, values) {
    var filmsArray = [];
    values.forEach((value) => {
      var film = value.films[0];
      // Check if film already exist in array
      var index = filmsArray.map(e => e.film_title).indexOf(film.film_title);
      if(index >= 0)
        filmsArray[index].amount += film.amount;
      else
        filmsArray.push(film);

    });
    // Sort the array
    filmsArray = filmsArray.sort((a,b) => (a.film_title > b.film_title) ? 1 : ((b.film_title > a.film_title) ? -1 : 0))
    var result = {
      films: filmsArray
    };
    return result;
}

var finalize = function(key, reducedObj) {
  var totAmount = 0;
  reducedObj.films.forEach((film) => {
    totAmount += film.amount;
    film.amount = +parseFloat(film.amount).toFixed(2);
  });
  reducedObj.totAmount = +parseFloat(totAmount).toFixed(1);
  return reducedObj;
}

mongoose.connection
  .on('connected', () => {
    console.log(`Mongoose connection open on mongodb://localhost:27017/nmbp`);

    connection.db.collection('dvdrent', (err, collection) => {
      if(err) throw err;
      //Get all comedy films rented out by Larry Foster
      var filters = {
        "staff.first_name": "Larry",
        "staff.last_name": "Foster",
        "film.categories": { $elemMatch: {name: "Comedy"}}
      };
      collection.mapReduce(map,
        reduce,
        {
          out: 'hw_first',
          query: filters,
          finalize: finalize
        }
      ).then(() => {console.log("mapReduce finished!")})
    })
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });
