const Chat = require('./models/Chat');
const User = require('./models/User');

module.exports = function(io){
  let users = {};
  let datos = {};
  io.on('connection', async socket => {
    console.log('new user connected');

    socket.on('login', async (data, cb) =>{
      let loginUser = await User.find(data);
      if(loginUser.length == 0){
        cb(false);
      }
      else{
        cb(true);
        socket.nickname = loginUser[0].user;
        datos[loginUser[0]._id] = {user: loginUser[0].user, name: loginUser[0].first_name+" "+loginUser[0].last_name}
        users[socket.nickname] = socket;
        users[socket.nickname].emit('getMyUser', loginUser[0].user);
        updateNicknames();
      }
    });

    socket.on('send message', async data => {
      if (data.user in users){
        users[data.user].emit('new message', {
          msg: data.msg,
          nick: socket.nickname
        });
        socket.emit('new message', {
          msg: data.msg,
          nick: socket.nickname
        });
        var newMsg = new Chat({
          msg: data.msg,
          nick: socket.nickname,
          to: data.user
        });
        await newMsg.save();
      }
    });

    socket.on('sing-up', async data => {
      var newUser = new User(data);
      await newUser.save((err, results) => {
        console.log(results);
      });
    });

    socket.on('chat', async data => {
      let messages = await Chat.find({"$or": [{"$and": [{"nick": `${data.from}`},{"to": `${data.to}`}]},{"$and": [{"nick": `${data.to}`},{"to": `${data.from}`}]}]});
      socket.emit('db-msgs', messages);
    });

    socket.on('typing', data => {
      if (data.to in users){
        users[data.to].emit('typing-me', {
          msg: data.message,
          nick: socket.nickname
        });
      }
    });

    socket.on('stop typing', data => {
      if (data.to in users){
        console.log(data.from+" is not typing");
        users[data.to].emit('not-typing-me', {
          msg: data.message,
          nick: socket.nickname
        });
      }
    });

    socket.on('disconnect', data => {
      if(!socket.nickname) return;
      console.log(socket.nickname+' desconectado');
      delete users[socket.nickname];
      updateNicknames();
    });

    function updateNicknames(){
      io.sockets.emit('usernames', datos);
    }
  });
}
