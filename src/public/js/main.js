const socket = io();

const $messageform = $('#message-form');
const $messageBox = $('#message');
const $chat = $('#chat');
const $nickForm = $('#nickFrom');
const $nickError = $('#nickError');
const $nickname = $('#nickname');
const $usuarios = $('#usernames');
var nombre;

$(function(){
    $nickForm.submit(e => {
    e.preventDefault();
    socket.emit('new user', $nickname.val(), data => {
      if(data){
        $('#nickWrap').hide();
        $('#contentWrap').show();
      }
      else{
        $nickError.html('<div class="alert alert-danger">That username already exist.</div>');
      }
      $nickname.val('');
    });
  });

  $messageform.submit( e => {
    e.preventDefault();
    socket.emit('send message', {user: nombre, msg: $messageBox.val()});
    $messageBox.val('');
  });

  socket.on('new message', data => {
    $chat.append('<b>'+ data.nick + '</b>: '+ data.msg+'<br/>');
  });

  socket.on('usernames', data => {
    let html = '';
    for(let i=0; i<data.length; i++){
      html += `<p><button onclick="newchat('${data[i]}')"><i class="fas fa-user"></i> ${data[i]}</button></p>`
    }
    $usuarios.html(html);
  });

  socket.on('whisper', data => {
    $chat.append(`<p class="whisper"><b>${data.nick}:</b> ${data.msg}</p>`);
  });

  socket.on('load old msgs', msgs => {
    for(let i=0; i<msgs.length; i++){
      displayMsg(msgs[i]);
    }
  });

  function displayMsg(data){
    $chat.append(`<p class="whisper"><b>${data.nick}:</b> ${data.msg}</p>`);
  }
});

function newchat(user){
  $('#nombrechat').html("Chat con <b id='nom'>"+user+"</b>");
  nombre = user;
}
