const express = require('express')
const app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http)
const port = 3000



if(false){
	//Just log messages on users connecting or disconnecting from the index page
	app.get('/', (req, res) => res.sendFile(__dirname + '/index_1.html'))
	io.on('connection', function(socket){
  		console.log('socket-id "'+socket['id']+'" connected');
  		socket.on('disconnect', function(){
    		console.log('socket-id "'+socket['id']+'" disconnected');
  		});
	});
}
else if(false){
	var connected_users = {};
	//Log messages and broadcast to all clients on default namesapce and room
	app.get('/', (req, res) => res.sendFile(__dirname + '/index_2.html'))
	io.on('connection', function(socket){
  		console.log('socket-id "'+socket['id']+'" connected');
  		connected_users[socket['id']] = {};//Maybe include the list of devices this client is connected to
  		io.emit('connection_event',{'message':'socket-id "'+socket['id']+'" connected', 'connected_users':connected_users});


  		socket.on('disconnect', function(){
    		console.log('socket-id "'+socket['id']+'" disconnected');
    		delete connected_users[socket['id']];
    		io.emit('disconnection_event',{'message':'socket-id "'+socket['id']+'" disconnected', 'connected_users':connected_users});
    		
  		});
  		//Listen for submit_event on sockets
  		socket.on('submit_event', function(obj){
    		console.log('socket-id "'+socket['id']+'" sent message to person: ' + obj['person']+' "'+obj['message']+'"');
  			//if you want to send something to all the clients connect to the current io namespace
  			//io on server side send or listen to events from client side
  			io.emit('processed_event', {'message':'socket-id "'+socket['id']+'" sent message to person: ' + obj['person']+' "'+obj['message']+'"'});
  		});

	});
}
else{
//Log messages and broadcast to all clients on test namespace and room
	var connected_users = {};
	var users_in_room = {};
	//Log messages and broadcast to all clients on default namesapce and room
	app.get('/', (req, res) => res.sendFile(__dirname + '/index_3.html'))
	io.on('connection', function(socket){
  		console.log('socket-id "'+socket['id']+'" connected');
  		connected_users[socket['id']] = {};//Maybe include the list of devices this client is connected to
  		io.emit('connection_event',{'message':'socket-id "'+socket['id']+'" connected', 'connected_users':connected_users});


  		socket.on('disconnect', function(){
    		console.log('socket-id "'+socket['id']+'" disconnected');
    		delete connected_users[socket['id']];
    		io.emit('disconnection_event',{'message':'socket-id "'+socket['id']+'" disconnected', 'connected_users':connected_users});
    		for(room in users_in_room){
    			for(socket_id in users_in_room[room]){
    				if(socket_id == socket['id']){
    					delete users_in_room[room][socket_id]
    					io.to(room).emit('room_leave_event',{'message':'left room '+room, 'users_in_room':users_in_room[room], 'room':room});
    					break
    				}
    			}
    			if(socket_id == socket['id']){
    				break
    			}
    		}
    		
  		});
  		//Listen for set_room event from client

  		socket.on('set_room',function(obj){
  			console.log('Room name: '+obj['room']+' for username: '+obj['username'])
  			socket.join(obj['room']);
  			if(users_in_room[obj['room']] == null){
  				users_in_room[obj['room']] = {}
  			}
  			users_in_room[obj['room']][socket['id']] = obj['username']
  			io.to(obj['room']).emit('room_join_event',{'message':'joined room '+obj['room'], 'users_in_room':users_in_room[obj['room']], 'room':obj["room"]});
  		});

  		socket.on('send_private_message',function(obj){
  			if(obj['to_socket'] in users_in_room[obj['room']]){
  				console.log('Message "'+obj['message']+'" sent to socket_id:'+obj['to_socket']);
  				io.to(obj['to_socket']).emit('recieved_private_message',obj['message']);	
  			}
  			else{
  				var msg = 'Message not sent to socket_id:'+obj['to_socket']+" since the user is not part of this room"
  				console.log(msg);
  				io.to(socket['id']).emit('recieved_private_message',msg);
  			}
  			
  		});

	});
}


http.listen(3000, function(){
  console.log('listening on *:3000');
});