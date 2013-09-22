var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server),
users = {},
redis = require('redis').createClient();
var path = require('path');
server.listen(8080);
app.use(express.bodyParser({ keepExtensions: true,uploadDir: __dirname + '/upload'}));
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
app.post('/upload', function(req, res) {
 	var val = [];
 	var str = req.files.image.path;
 	var target = str.replace('/home/laukik/webchat','');
 	val[0] = req.param('username');
 	redis.hset('picture',val[0],target,function(err,status){
				if(err) throw err;
	});
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
		var url;
		redis.hget('picture',name,function(err,status){
			if(err) throw err;
			if(status){
				url = status;
				console.log(status);
				socket.emit('photo',status);
			}
			socket.emit('reply','welcome ',name);
			socket.broadcast.emit('another',url,name + ' is connected.');
		});
	});
	socket.on('msg',function(name,data){
		redis.hget('picture',name,function(err,status){
			if(err) throw err;
			if(status){
				socket.broadcast.emit('print', status,data);
			}
		});
	});
	socket.on('disconnect',function(){
		
	});
});
