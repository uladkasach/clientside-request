const express = require('express')
const app = express()

/* enable parsing of post bodies */
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

/* log reqeusts */
var morgan = require('morgan');
app.use(morgan('dev')); // send morgan message to winston


/* define routes that should not have cross origin defined */
app.get('/no_cross_origin', (req, res) =>{
    res.send('hello') // respond with "Hello!"
})

/* allow cross origin */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


/* define routes */
app.get('/say_hello', (req, res) =>{
    res.send('hello') // respond with "Hello!"
})
app.get('/query', (req, res) =>{
    res.json(req.query) // respond with query data
})
app.post('/post/json', (req, res) =>{
    console.log(req.body);
    res.json(req.body) // respond with request body
})
app.post('/post/form', (req, res) =>{
    console.log(req.body);
    res.json(req.body) // respond with request body
})

/* start server */
app.listen(3000, () => console.log('Testing Server listening on port 3000!'))
