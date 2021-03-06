const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const app = express();

const server = http.createServer(app);
const io = socketio.listen(server);

mongoose.connect('mongodb+srv://chatjs:chatjs@cluster0.00rpi.mongodb.net/test')
  .then(db => console.log('db is connect'))
  .catch(err => console.log(err));

app.set('port', process.env.PORT || 3000);

require('./sockets')(io);

app.use(express.static(path.join(__dirname, 'public')));

server.listen(app.get('port'), () => {
  console.log("server on port "+app.get('port'));
});
