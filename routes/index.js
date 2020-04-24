var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var myText = req.query.mytext; //mytext is the name of your input box
    res.send('Train Search:' +myText); 
  res.render('index', { title: 'Express' });
});

module.exports = router;
