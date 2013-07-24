var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server),
users = {},
redis = require('redis').createClient();
server.listen(8080);
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(__dirname + '/'));
app.get('/',function(req,res){
	res.sendfile( __dirname + '/sign.html');
});
io.sockets.on('connection',function(socket){
	socket.on('validate',function(user,pass){
		redis.hget('users',user,function(err,status){
			if(err) throw err;
			//console.log(status); done
			if(status){
				if(pass === status){
					//login, route to index.html
					socket.emit('forward');
				}else{
					//invalid password
					socket.emit('wrong-password');
				}

			}else{
				//invalid username
				socket.emit('wrong-user-id');
			}
		});
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
