var express = require('express');
var http = require('http');
var path = require('path');
var blog = require('./lib/model');
//var db = require('./lib/db');
var routes = require('./lib/routes');
var lib = require('./lib/lib');

var app = express();

app.configure(function() {
	app.set('port', process.env.PORT || 3000);
//	app.set('views', __dirname + '/views');
	app.set('views', __dirname + '/views/article');
	app.set('view engine', 'jade');
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({secret: 'secretpasswordforsessions', store: lib.getSessionStore()
}));
	app.use(express.static(path.join(__dirname, 'public')));
});

//app.get('/', blog.findAll);

app.get('/', blog.article);

app.get('/blog', blog.findAll);
app.get('/blog/new', blog.newBlog);
app.post('/update/:id', blog.update);
app.get('/blog/:id', blog.findById);
app.post('/blog/new', blog.addBlog);
app.post('/updateBlog', blog.updateBlog);
app.post('/deleteBlog', blog.deleteBlog);
app.post('/blog/addComment', blog.addCommentToBlog);

app.get('/api/user/:username', routes.getUser);
app.post('/signup', routes.signup);
app.post('/login', routes.login);

var server = http.createServer(app);

server.listen(app.get('port'), function() {
	console.log('Listening on port: ' + app.get('port'));
	lib.createSocket(server);
});