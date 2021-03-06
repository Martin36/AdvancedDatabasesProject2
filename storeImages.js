require('dotenv').config();
require('./models/Image');
//const Image = require('.models/Image');
// const app = require('./app');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const ObjectId = require('mongodb').ObjectId;

const Image = mongoose.model('Image');

mongoose.connect(process.env.DATABASE);

mongoose.Promise = global.Promise;
mongoose.connection
  .on('connected', () => {
    console.log(`Mongoose connection open on ${process.env.DATABASE}`);

    mongoose.connection.db.collection('articles', (err, collection) => {
      if(err) throw err;
      let counter = 0;
      collection.find().forEach((article) => {
        Image.aggregate([{ $sample: {size: 1 } }], (err, img) => {
          //console.log(++counter);
          collection.updateOne({"_id": ObjectId(article._id)}, {
            $set: {
              "img": img
            }
          }).then((obj) => console.log(obj.result));
        });
      })
    })


      // var imageData = fs.readFileSync('./images/drawings/jpg/1601_mainfoto_05.jpg');
      // console.log("imageData:", imageData);
      // // Create an Image instance
      // const image = new Image({
      //   data: imageData,
      //   contentType: 'image/jpg',
      // });

  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });

// const server = app.listen(3000, () => {
//   console.log(`Express is running on port ${server.address().port}`);
// });

function updateImages() {
  Image.remove(err => {
    if(err) throw err;
    console.log("Removed all documents in 'images' collection.");
    const dirname = "./images/drawings/jpg/";
    // Read all image files in folder
    fs.readdir(dirname, function(err, filenames) {
      if(err) throw err;
      // Remove non-jpg files
      filenames = filenames.filter(function(d) {
        return d.includes('.jpg');
      });
      filenames.forEach(function(filename) {
        fs.readFile(dirname + filename, function(err, imgData) {
          if(err) throw err;
          const image = new Image({
            data: imgData,
            contentType: 'image/jpg',
          });
          // Store the Image to the MongoDB
          image.save();
        })
      })
      console.log(filenames);
    })
  })
}
