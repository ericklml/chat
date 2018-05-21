const socket = io();

const $messageform = $('#message-form');
const $messageBox = $('#message');
const $chat = $('#chat');
const $loginFrom = $('#loginFrom');
const $nickError = $('#nickError');
const $nickname = $('#nickname');
const $password = $('#password');
const $usuarios = $('#usernames');
const $regist = $('#regist');
const $registFrom = $('#registFrom');
var nombre;
var myUser;
var typing = false;
var lastTypingTime;
var TYPING_TIMER_LENGTH = 400;
var intervalo;
var data;

$(function(){
  $nickname.focus();
  $('#title').html(`<h1 class="navbar-brand mx-auto">Let's Chat!</h1>`);
    $loginFrom.submit(e => {
    e.preventDefault();
    socket.emit('login', {user: $nickname.val(), password: $password.val()}, data => {
      if(data){
        $('#nickWrap').hide();
        $('#contentWrap').show();
      }
      else{
        $nickError.html('<div class="alert alert-danger">User Not Found.</div>');
      }
      $nickname.val('');
      $password.val('');
    });
  });

  $messageform.submit( e => {
    e.preventDefault();
    socket.emit('send message', {user: nombre, msg: $messageBox.val()});
    $messageBox.val('');
  });

  socket.on('new message', data => {
    if(data.nick === nombre || data.nick === myUser){
      if(data.nick === myUser){
        $chat.append(`<p class="text-right">${data.msg} <b>:${data.nick}</b></p>`);
      }
      else{
        $chat.append(`<p class="text-left"><b>${data.nick}: </b> ${data.msg}</p>`);
      }
    }
  });

  socket.on('getMyUser', data => {
    myUser = data;
    $('#title').html(`<h1 class="navbar-brand mx-auto">Let's Chat ${data}!</h1>`);
  });

  socket.on('usernames', data => {
    let valores = Object.values(data);
    let html = '';
    for(let i=0; i<valores.length; i++){
      if(valores[i].user != myUser){
        html += `<button class="btn btn-dark btn-lg" onclick="newchat('${valores[i].user}')"><i class="fas fa-user"></i> ${valores[i].user}<br/>${valores[i].name}</button>`
      }
    }
    $usuarios.html(html);
  });

  $messageBox.typing({
    start: function (event, $elem) {
      data = {'typing': true, 'message': 'is typing!', 'from': myUser, 'to': nombre};
      console.log("escribiendo");
      socket.emit('typing', data);
    },
    stop: function (event, $elem) {
      data = {'typing': true, 'message': 'is typing!', 'from': myUser, 'to': nombre};
        console.log("ya no");
        socket.emit('stop typing', data);
    },
    delay: 1500
  });

  socket.on('typing-me', data => {
    $('#isTyping').html(`<b>${data.nick}</b> ${data.msg}`);
  });

  socket.on('not-typing-me', data => {
    $('#isTyping').empty();
  });

  socket.on('load old msgs', msgs => {
    for(let i=0; i<msgs.length; i++){
      displayMsg(msgs[i]);
    }
  });

  socket.on('db-msgs', data => {
    let messages = Object.values(data);
    for(let i=0; i<messages.length; i++){
      if(messages[i].nick === myUser){
        $chat.append(`<p class="text-right">${messages[i].msg} <b>:${messages[i].nick}</b></p>`);
      }
      else{
        $chat.append(`<p class="text-left"><b>${messages[i].nick}: </b> ${messages[i].msg}</p>`);
      }
    }
  });

  $regist.click(function(){
    $('#nickWrap').hide();
    $('#registWrap').show();
  });

  $registFrom.submit( e => {
    e.preventDefault();
    socket.emit('sing-up', {first_name: $('#name').val(), last_name: $('#last').val(), user: $('#user').val(), email: $('#email').val(), password: $('#pass').val()});
    $('#name').val('');
    $('#last').val('');
    $('#user').val('');
    $('#email').val('');
    $('#pass').val('');
    $('#nickWrap').show();
    $('#registWrap').hide();
  });

  function displayMsg(data){
    $chat.append(`<p class="whisper"><b>${data.nick}:</b> ${data.msg}</p>`);
  }
});

function newchat(user){
  $('#nombrechat').html(`Chat with ${user}`);
  nombre = user;
  $chat.empty();
  socket.emit('chat', {from: myUser, to: nombre});
}
