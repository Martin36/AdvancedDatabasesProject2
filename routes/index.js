const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator/check');

const router = express.Router();
const Registration = mongoose.model('Registration');
const Comment = mongoose.model('Comment');

const ObjectId = require('mongodb').ObjectId;

const connection = mongoose.connection;

//2.1
router.get('/', (req, res) => {
  connection.db.collection('articles', (err, collection) => {
    if(err) throw err;
    // Only retrieve article with authors
    var filter = { author: { $exists: true, $ne: ''}};
    collection.find(filter).sort({date: -1}).limit(10).toArray((err, articles) => {
      articles.forEach((article) => {
        var encodedSource = article.img[0].data.toString('base64');
        var imgSrc = 'data:' + article.img[0].contentType + ';base64,' + encodedSource;
        article.imgSrc = imgSrc;
      })
      res.render('articles', {title: "Articles", articles});
    })
  })
});

router.post('/addcomment', (req, res) => {
  const id = req.body.id;
  const comment = req.body.comment;
  const date = new Date();

  connection.db.collection('articles', (err, collection) => {
    if(err) throw err;
    // Add comment to comments array
    var commentObj = { "comment": comment, "date": date };
    collection.updateOne({"_id": ObjectId(id)}, { "$push": { "comments": commentObj }}).then((obj) => {
      res.send("Thank you for the comment");
    });
  })
})

//2.2
router.get('/comments', (req, res) => {
  var mapFunction = function() {
    var nrOfComments = this.comments ? this.comments.length : 0;
    emit(this._id, nrOfComments);
  }
  var reduceFunction = function(id, comments) {
    return comments;
  }

  // var result = reduceFunction("myId", testArray);
  // console.log("Results:", result);

  connection.db.collection('articles', (err, collection) => {
    if(err) throw err;
    // collection.findOne({_id: ObjectId('5c17d4462e9d2b4eca1c952b')}).then((doc) => {
    //   mapFunction.apply(doc);
    // });

    collection.mapReduce(mapFunction, reduceFunction, {out: 'total_comments'}).then(() => {
      connection.db.collection('total_comments', (err, collection) => {
        if(err) throw err;
        collection.find({}).sort({value: -1}).limit(10).toArray((err, articles) => {
          res.render('article-list', {title: 'Comments', articles});
        });
      })
    })
  })
})

module.exports = router;
