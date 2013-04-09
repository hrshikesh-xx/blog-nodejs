var express = require('express');
var blog = require('./blog');

var app = express();

app.configure(function() {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
});

app.get('/', function(req, res) {
	res.send('Hari Bol !!');
});

app.get('/blog', blog.findAll);
app.get('/blog/:id', blog.findById);
app.post('/blog/new', blog.addBlog);
app.put('/blog/:id', blog.updateBlog);
app.delete('/blog/:id', blog.deleteBlog);
app.post('/blog/addComment/:id', blog.addCommentToBlog);

app.listen(3000, '127.0.0.1', function() {
	console.log('Listening on port 3000...');
});