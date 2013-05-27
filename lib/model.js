var mongoose = require('mongoose');
var data = require('./data');
mongoose.connect('mongodb://localhost/node_blog_mongoo', function(err) {
  if (err) { throw err; }
});

var blogCollectionSchema = new mongoose.Schema({
	author: {type: String, default: '', trim: true},
	title: {type: String, default: '', trim: true},
	blog: {type: String, default: ''},
	created_at: {type: Date, default: Date.now},
	comments: [{
		reader: {type: String, default: ''},
		comment: {type: String, default: ''},
		created_at: {type: Date, default: Date.now}
	}]
});

mongoose.model('my_blogs', blogCollectionSchema);
var blogCollectionModel = mongoose.model('my_blogs');

var userCollectionSchema = new mongoose.Schema({
	username: {type: String, default: '', trim: true},
	email: {type: String, default: '', trim: true},
	password: {type: String, default: ''}
});

mongoose.model('users', userCollectionSchema);
var userCollectionModel = mongoose.model('users');


var blogs = [{author: data.author[0], title: data.title[0], blog: data.blog[0], created_at: new Date(), comments: [{reader: 'blog reader one', comment: 'comment one', created_at: new Date()},
	{reader: 'blog reader two', comment: 'comment two', created_at: new Date()}]},
	{author: data.author[1], title: data.title[1], blog: data.blog[1], created_at: new Date(), comments: []},
	{author: data.author[2], title: data.title[2], blog: data.blog[2], created_at: new Date(), comments: []}];

for(var i = 0; i < blogs.length; i++) {
	saveMongoose(blogs[i], blogCollectionModel);
}

var defaultUser = [{username:'Default User', email: 'email@email.com', password: 'password'}];

for(var i = 0; i < defaultUser.length; i++) {
	saveMongoose(defaultUser[i], userCollectionModel);
}

function saveMongoose(document, collectionModel, callback) {
	var collection = new collectionModel(document);

	collection.save(function (err) {
	  if (err) { throw err; }
	  console.log('Commentaire ajouté avec succès !');

	  mongoose.connection.close();
	  if(callback) {
	  	callback();
	  }
	});
}

function connectBlog() {
	mongoose.connect('mongodb://localhost/node_blog_mongoo');
	blogCollectionModel = mongoose.model('my_blogs');
	return blogCollectionModel;
}

function connectUser() {
	mongoose.connect('mongodb://localhost/node_blog_mongoo');
	userCollectionModel = mongoose.model('users');
	return userCollectionModel;
}

var findAll = function(req, res) {
	console.log('Retrieving all blogs:');
	
	blogCollectionModel = connectBlog();
	blogCollectionModel.find(null, function (err, comms) {
	  if (err) { throw err; }
	  console.log(comms);
	  res.render('index', {title: 'Blog', articles:comms});
	  mongoose.connection.close();
	});
};

var findById = function(req, res) {
	var id = req.params.id;
	console.log('Retrieving blog with id: ' + id);

	blogCollectionModel = connectBlog();
  blogCollectionModel.findOne({_id: id}, function (err, item) {
	  if (err) { throw err; }

	  res.render('item', {title: item.title, item: item});
	  mongoose.connection.close();
	});
};

var newBlog = function(req, res) {
	res.render('new_blog', {title: 'New Blog'});
};

var addBlog = function(req, res) {
	var blog = {
		author: req.body.author,
		title: req.body.title,
		blog: req.body.blog,
		created_at: new Date(),
		comments: []
	};

	blogCollectionModel = connectBlog();
	saveMongoose(blog, blogCollectionModel, function() {
		console.log('Inserted blog successfully:');
		res.redirect('/blog');		
	});
};

var updateBlog = function(req, res) {
	var id = req.body._id;
	var comment;

	blogCollectionModel = connectBlog();
	blogCollectionModel.findOne({_id: id}, function(err, item) {
		if(req.body.title === undefined)
			req.body.title = item.title;
		if(req.body.blog === undefined)
			req.body.blog = item.blog;
		comment = item.comments;

		var blog = {
			author: item.author,
			title: req.body.title,
			blog: req.body.blog,
			comments: comment,
			created_at: new Date()
		};

		blogCollectionModel.update({_id: id}, blog, {safe: true}, function(err, intem) {
			if(err) {
				console.log('Error updating blog with: ' + id + '\n' + 'Error: ' + err);
			} else {
				console.log('Updated the blog with id: ' + id);
				mongoose.connection.close();
				res.redirect('/blog');
			}
		});
	});	
};

var update = function(req, res) {
	var id = req.params.id;
	console.log('updating blog with id: ' + id);

	blogCollectionModel = connectBlog();
	blogCollectionModel.findOne({_id: id}, function(error, item) {
		res.render('update_blog', {title: item.title, item: item});
		mongoose.connection.close();
	});
};

var deleteBlog = function(req, res) {
	var id = req.body._id;

	blogCollectionModel = connectBlog();
	blogCollectionModel.remove({_id: id}, function (err) {
		if(err) {
			console.log('Error deleting blog with: ' + id + '\n' + 'Error: ' + err);
		} else {
			console.log('Deleted blog with id: ' + id);
			mongoose.connection.close();
			res.redirect('/blog');
		}
	});
};

var addCommentToBlog = function(req, res) {
	var id = req.body._id
	var comment = {
		reader: req.body.reader,
		comment: req.body.comment,
		created_at: new Date()
	};

	blogCollectionModel = connectBlog();
	blogCollectionModel.update({_id: id}, {$push: {comments: comment}}, function(err, item) {
		mongoose.connection.close();
		res.redirect('/blog/' + id);
	});
};

module.exports.findAll = findAll;
module.exports.findById = findById;
module.exports.newBlog = newBlog;
module.exports.addBlog = addBlog;
module.exports.update = update;
module.exports.updateBlog = updateBlog;
module.exports.deleteBlog = deleteBlog;
module.exports.addCommentToBlog = addCommentToBlog;



module.exports.article = function(req, res) {
	//res.render('index', {email: "example@example.com"});
	console.log('Retrieving all blogs:');
	
	blogCollectionModel = connectBlog();
	blogCollectionModel.find(null, function (err, comms) {
	  if (err) { throw err; }
	  console.log(comms);
	  res.render('index', {title: 'Blog', articles:comms});
	  mongoose.connection.close();
	});
};

module.exports.addUser = function(user, callback) {
	userCollectionModel = connectUser();
	saveMongoose(user, userCollectionModel, function() {
		console.log('Inserted user successfully:');
		callback();
		//res.redirect('/blog');
		mongoose.connection.close();		
	});
};

module.exports.findUser = function(username, callback) {
//	var id = req.params.id;
	console.log('Retrieving user with username: ' + username.username);

	userCollectionModel = connectUser();
  userCollectionModel.findOne(username, function (err, item) {
	  if (err) { throw err; }
	  callback(err, item);
//	  res.render('item', {title: item.title, item: item});
	  mongoose.connection.close();
	});
};