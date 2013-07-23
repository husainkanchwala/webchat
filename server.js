var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server),
users = {},
redis = require('redis').createClient();
server.listen(8080);
app.get('/',function(req,res){
	res.sendfile( __dirname + '/sign.html');
});
io.sockets.on('connection',function(socket){
	socket.on('validate',function(user,pass){

	});
	socket.on('adduser',function(name){
		socket.users = name;
		console.log(socket.users);
		socket.emit('reply','welcome ',name+'<br/>');
		socket.broadcast.emit('reply',name,' is connected'+'<br/>');
	});
	socket.on('msg',function(data){
		socket.broadcast.emit('print',socket.users+' : '+data);
	});
	socket.on('disconnect',function(){
		
	});
});
