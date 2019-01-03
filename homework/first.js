require('dotenv').config();
const mongoose = require('mongoose');
const connection = mongoose.connection;
const ObjectId = require('mongodb').ObjectId;

mongoose.connect(process.env.DATABASE, {useNewUrlParser: true});
mongoose.Promise = global.Promise;

mongoose.connection
  .on('connected', () => {
    console.log(`Mongoose connection open on ${process.env.DATABASE}`);

    connection.db.collection('articles', (err, collection) => {
      if(err) throw err;
        
    })
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });
