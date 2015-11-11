var express = require('express');
var PORT = process.env.HTTP_PORT || 3000;
var app = express();

// Route
app.get('/', function (req, res) {

    res.send('hello world');

});

app.listen(PORT);