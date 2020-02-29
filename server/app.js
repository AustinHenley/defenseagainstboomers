
var Canvas = require('canvas');
var express = require('express');
var fs = require('fs');
const bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/generateimage', (req, res) => {
    ProcessString(req.body.input, req.body.color, req.body.width, req.body.height).then((base64Image) => {
        res.json({src: base64Image})
    }).catch((err) => {
        console.log(err);
        res.send(500);
    });
});

async function ProcessString(string, color, width, height){
    var Image = new Canvas.Image;
    var canvas = Canvas.createCanvas(width != '' ? parseInt(width) : 800, height != '' ? parseInt(height) : 800);
    var context = canvas.getContext('2d');
    var invalidChars = /["#$%&'()*+,\-./:;<=>@[\]^_`{|}~1-9\\]/g;
    string = string.replace(invalidChars, '');
    var base64Image = '';
    var xPos = 10, yPos = 20, defaultImageWidth = 60, defaultImageHeight = 60, scale = 0.5;
    var scaledImageWidth = defaultImageWidth * scale, scaledImageHeight = defaultImageHeight * scale;
    var numberOfLettersPerRow = Math.floor(canvas.width / scaledImageWidth);
    var lineBreaks = [];
    var currentRow = [];
    var charCount = 0;
    var extraSpace = 0;
    for(word of string.split(' ')){
        if(numberOfLettersPerRow > charCount + word.length){
            currentRow.push(word);
            charCount += word.length + 1;
        }
        else{
            lineBreaks.push(currentRow.join(' '));
            currentRow = [word];
            charCount = word.length;
        }
    }
    if(currentRow != []) lineBreaks.push(currentRow.join(' '));
    
    for(line of lineBreaks){
        if((line.length + 1) * (scaledImageWidth) >= canvas.width){
            extraSpace += 1;
        }
    }
    canvas.height = height != '' ? parseInt(height) : (lineBreaks.length + extraSpace) * (scaledImageHeight + 20) + 10;
    context.beginPath();
    context.moveTo(0, 00);
    context.lineTo(0, canvas.height);
    context.lineTo(canvas.width, canvas.height);
    context.lineTo(canvas.width, 0);
    context.closePath();
    context.lineWidth = 5;
    context.fillStyle = color;
    context.fill();
    for(line of lineBreaks){
        for(letter of line){
            var fixedLetter = `${letter.toUpperCase()}${(letter != ' ' ? '.png' : '')}`;
            if(fixedLetter != ' '){
                const file = await Canvas.loadImage(__dirname + `/unown/${fixedLetter}`).then((image) => {
                    scaledImageWidth = image.width * scale;
                    scaledImageHeight = image.height * scale;
                    if(xPos + scaledImageWidth >= canvas.width){
                        xPos = 10;
                        yPos += scaledImageHeight + 5;
                    }
                    context.drawImage(image, xPos, yPos, scaledImageWidth, scaledImageHeight);

                    xPos += scaledImageWidth + 5;
                    
                }).then(() => {
                    base64Image = canvas.toDataURL();
                });
            }
            else{
                context.beginPath();
                context.moveTo(0, 00);
                context.lineTo(xPos, 0);
                context.lineTo(xPos + 20, 0);
                context.lineTo(xPos + 20, 0);
                context.closePath();
                context.lineWidth = 5;
                context.fillStyle = color;
                context.fill();
                xPos += 20;
            }
        
        }
        xPos = 10;
        yPos += scaledImageHeight + 20;
    }
    return base64Image;
}



app.listen(5000, () => {
    console.log('listening on port 5000');
});