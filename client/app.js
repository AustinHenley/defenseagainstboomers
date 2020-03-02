const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');

var app = express();

app.set('view engine', 'ejs');
app.set('views', 'Views');

app.use(express.static(path.join(__dirname, 'Content')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    var srcObject = res.app.get('srcObject');
    res.app.set('srcObject', null);
    res.render('Home/Index', {srcObj: srcObject});
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
        var request = new http.ClientRequest({
            port: 80,
            path: "/api/generateimage",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(requestObject)
            }
          }, res => {
            res.on('data', function(d) {
                body += d;
            });
            res.on('end', function() {
                response = JSON.parse(body);
                req.app.set('srcObject', response);
                resp.redirect('/');
            });
            res.on('error', function(err) {
                console.log(err);
                resp.redirect('/');
            });
          });
        
          request.end(requestObject);
    
          requestMessage = "Successfully sent request";
        }
      catch(err){
          console.log(err);
        requestMessage = "Failed to connect to /api/generateimage";
        resp.redirect('/');
      }
    
        console.log(requestMessage);
});

app.listen(5001, () => {
    console.log('listening on port 5001');
});