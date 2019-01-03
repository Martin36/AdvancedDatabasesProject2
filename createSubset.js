require('dotenv').config();
const mongoose = require('mongoose');
const connection = mongoose.connection;
const ObjectId = require('mongodb').ObjectId;

mongoose.connect(process.env.DATABASE, {useNewUrlParser: true});
mongoose.Promise = global.Promise;

mongoose.connection
  .on('connected', () => {
    connection.db.collection('articles', (err, collection) => {
      if(err) throw err;

      connection.db.collection('article_subset', (err, subset) => {
        if(err) throw err;
        //First remove the subset then create the new one
        subset.drop().then(() => {
          collection.find({}).limit(100).toArray().then((objects) => {
            subset.insertMany(objects, (err, res) => {
              if(err) throw err;
              console.log("Inserted elements: " + res.insertedCount);
            });
          })
        })
      })
    })
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });
