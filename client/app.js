const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const axios = require('axios');

var app = express();

app.set('view engine', 'ejs');
app.set('views', 'Views');

app.use(express.static(path.join(__dirname, 'Content')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    var srcObject = res.app.get('srcObject');
    var err = res.app.get('error')
    res.app.set('srcObject', null);
    res.render('Home/Index', {srcObj: srcObject, error: err});
});

app.post('/generateimage', (req, resp) => {
    var requestObject = JSON.stringify({
        input: req.body.input,
        color: req.body.color,
        width: req.body.width,
        height: req.body.height
      });

      var requestMessage = "";

      try{
          var response = {};
          var body = [];
          axios.post("/api/generateimage", {
            input: req.body.input,
            color: req.body.color,
            width: req.body.width,
            height: req.body.height
          }).then(res => {
              req.app.set('srcObject', res);
          }).catch(err => {
              req.app.set('error', err);
              console.log(err);
          });
          resp.redirect('/');
    
          requestMessage = "Successfully sent request";
        }
      catch(err){
          console.log(err);
          req.app.set('error', err);
        requestMessage = "Failed to connect to /api/generateimage";
        resp.redirect('/');
      }
    
        console.log(requestMessage);
});

app.listen(5001, () => {
    console.log('listening on port 5001');
});