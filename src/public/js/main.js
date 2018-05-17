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

$(function(){
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

  socket.on('getMyUser', data => {
    myUser = data;
    $('#title').html(`<h1 class="navbar-brand mx-auto">Let's Chat ${data}!</h1>`);
  });

  socket.on('usernames', data => {
    let valores = Object.values(data);
    let html = '';
    for(let i=0; i<valores.length; i++){
      if(valores[i].user != myUser){
        html += `<button class="btn btn-dark btn-lg" onclick="newchat('${valores[i].user}', '${socket}')"><i class="fas fa-user"></i> ${valores[i].user}<br/>${valores[i].name}</button>`
      }
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

function newchat(user, socket){
  $('#nombrechat').html(`Chat with ${user}`);
  nombre = user;
  console.log({from: myUser, to: nombre});
}
