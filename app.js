var express = require('express');
var http = require('http');
var path = require('path');
var blog = require('./model');

var app = express();

app.configure(function() {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', blog.findAll);

app.get('/blog', blog.findAll);
app.get('/blog/new', blog.newBlog);
app.post('/update/:id', blog.update);
app.get('/blog/:id', blog.findById);
app.post('/blog/new', blog.addBlog);
app.post('/updateBlog', blog.updateBlog);
app.post('/deleteBlog', blog.deleteBlog);
app.post('/blog/addComment', blog.addCommentToBlog);

http.createServer(app).listen(app.get('port'), function() {
	console.log('Listening on port: ' + app.get('port'));
});