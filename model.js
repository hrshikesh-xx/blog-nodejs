var mongoose = require('mongoose');

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


var blogs = [{author: 'blog author one', title: 'title one', blog: 'blog one', created_at: new Date(), comments: [{reader: 'blog reader one', comment: 'comment one', created_at: new Date()},
	{reader: 'blog reader two', comment: 'comment two', created_at: new Date()}]},
	{author:'blog author two', title: 'title two', blog: 'blog two', created_at: new Date(), comments: []},
	{author:'blog author three', title: 'title three', blog: 'blog three', created_at: new Date(), comments: []}];

for(var i = 0; i < blogs.length; i++) {
	saveMongoose(blogs[i]);
}

function saveMongoose(document, callback) {
	var blogCollection = new blogCollectionModel(document);

	blogCollection.save(function (err) {
	  if (err) { throw err; }
	  console.log('Commentaire ajouté avec succès !');

	  mongoose.connection.close();
	  if(callback) {
	  	callback();
	  }
	});
}

function connectMongoose() {
	mongoose.connect('mongodb://localhost/node_blog_mongoo');
	blogCollectionModel = mongoose.model('my_blogs');
	return blogCollectionModel;
}

var findAll = function(req, res) {
	console.log('Retrieving all blogs:');
	
	blogCollectionModel = connectMongoose();
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

	blogCollectionModel = connectMongoose();
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

	blogCollectionModel = connectMongoose();
	saveMongoose(blog, function() {
		console.log('Inserted blog successfully:');
		res.redirect('/blog');		
	});
};

var updateBlog = function(req, res) {
	var id = req.body._id;
	var comment;

	blogCollectionModel = connectMongoose();
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

	blogCollectionModel = connectMongoose();
	blogCollectionModel.findOne({_id: id}, function(error, item) {
		res.render('update_blog', {title: item.title, item: item});
		mongoose.connection.close();
	});
};

var deleteBlog = function(req, res) {
	var id = req.body._id;

	blogCollectionModel = connectMongoose();
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

	blogCollectionModel = connectMongoose();
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