const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator/check');

const router = express.Router();
const Registration = mongoose.model('Registration');
const Comment = mongoose.model('Comment');

const ObjectId = require('mongodb').ObjectId;

const connection = mongoose.connection;

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
  //console.log(req.body);

})

router.get('/registrations', (req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('index', { title: 'Listing registrations', registrations });
    })
    .catch(() => { res.send('Sorry! Something went wrong.'); });
});

router.post('/',
  [
    body('name')
      .isLength({ min: 1 })
      .withMessage('Please enter a name'),
    body('email')
      .isLength({ min: 1 })
      .withMessage('Please enter an email'),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const registration = new Registration(req.body);
      registration.save()
        .then(() => { res.send('Thank you for your registration!'); })
        .catch(() => { res.send('Sorry! Something went wrong.'); });
    } else {
      res.render('form', {
        title: 'Registration form',
        errors: errors.array(),
        data: req.body,
      });
    }
  });

module.exports = router;


function find (name, query, cb) {
    mongoose.connection.db.collection(name, function (err, collection) {
       collection.find(query).toArray(cb);
   });
}
