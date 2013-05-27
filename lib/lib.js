var crypto = require('crypto')
,	model = require('./model')
,	cookie = require('cookie')
,	express = require('express')
, MemoryStore = express.session.MemoryStore;

//var db = require('./db')
var sessionStore = new MemoryStore();
var io;
var online = [];

module.exports = {
	createUser: function(username, email, password, callback) {
		var user = {username: username, email: email
			, password: encryptPassword(password)};
		model.addUser(user, callback);
	},
	getUser: function(username, callback) {
		model.findUser({username: username}, callback);
	},
	authenticate: function(username, password, callback) {
		model.findUser({username: username}, function(err, user) {
			if (user && (user.password === encryptPassword(password)))
				callback(err, user._id);
			else
				callback(err, null);
		});
	},
	getSessionStore: function() {
		return sessionStore;
	},
	createSocket: function(app) {
		io = require('socket.io').listen(app);
		io.configure(function (){
			io.set('authorization', function (handshakeData, callback) {
				if (handshakeData.headers.cookie) {
					handshakeData.cookie = cookie
						.parse(decodeURIComponent(handshakeData.headers.cookie));
					handshakeData.sessionID = handshakeData.cookie['connect.sid'];
					sessionStore.get(handshakeData.sessionID
						, function (err, session) {
							if (err || !session) {
								return callback(null, false);
							} else {
								handshakeData.session = session;
								console.log('session data', session);
								return callback(null, true);
							}
					});
				}
				else {
					return callback(null, false);
				}
			});
			io.sockets.on('connection', function (socket) {
				socket.on('clientchat', function (data) {
					var message = socket.handshake.session.username + ': '
						+ data.message + '\n';
					socket.emit('chat', { message: message});
					socket.broadcast.emit('chat', { message: message});
				});
				socket.on('disconnect', function (data) {
						var username = socket.handshake.session.username;
						var index = online.indexOf(username);
						online.splice(index, 1);
						socket.broadcast.emit('disconnect', { username: username});
				});
				socket.on('joined', function (data) {
					online.push(socket.handshake.session.username);
					var message = socket.handshake.session.username + ': '
						+ data.message + '\n';
					socket.emit('chat', { message: message
						, users: online});
					socket.broadcast.emit('chat', { message: message
						, username: socket.handshake.session.username});
				});
			});
		});
	}
}

function encryptPassword(plainText) {
	return crypto.createHash('md5').update(plainText).digest('hex');
}

