require('dotenv').config()
const ACCESS_TOKEN = process.env.CLIENT_ACCESS_TOKEN;
const APIAI_SESSION_ID = process.env.DEV_ACCESS_TOKEN;


const express = require('express');
const app = express();
const path = require('path');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const router = express.Router();



app.use('/.netlify/functions/server', router);  // path must route to lambda

app.use('/', express.static(path.resolve('views'))); //html
app.use('/', express.static(path.resolve('public'))); // js, css, images



const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});


const apiai = require('apiai')(ACCESS_TOKEN);

//WEB UI
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

const io = require('socket.io')(server);

io.on('connection', function (socket) {
  socket.on('chat message', (text) => {

    // Get a reply from API.AI

    let apiaiReq = apiai.textRequest(text, {
      sessionId: APIAI_SESSION_ID
    });

    apiaiReq.on('response', (response) => {
      let aiText = response.result.fulfillment.speech;
      socket.emit('bot reply', aiText); // Send the result back to the browser!
    });

    apiaiReq.on('error', (error) => {
      console.log(error);
    });

    apiaiReq.end();

  });
});


module.exports = app;
module.exports.handler = serverless(app);