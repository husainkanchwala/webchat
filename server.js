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
app.use(express.cookieParser());
app.get('/',function(req,res){
	res.sendfile( __dirname + '/sign.html');
});
app.get('/index.html',function(req,res){
	res.cookie('user',req.query.username,{httpOnly:false});
	res.sendfile(__dirname+'/index.html');
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
	socket.on('check',function(name){
		redis.hget('users',name,function(err,status){
			if(err) throw err;
			if(status){
				socket.emit('tell');
			}
		});
	});
	socket.on('newuser',function(name,pass){
		redis.hset('users',name,pass,function(err,status){
			if(err) throw err;
			socket.emit('forward');
		});
	});
	socket.on('adduser',function(name){
		console.log(name);
		socket.emit('reply','welcome ',name +'<br/>');
		socket.broadcast.emit('reply',name,' is connected'+'<br/>');
	});
	socket.on('msg',function(name,data){
		socket.broadcast.emit('print', name + ' : '+data);
	});
	socket.on('disconnect',function(){
		
	});
});
