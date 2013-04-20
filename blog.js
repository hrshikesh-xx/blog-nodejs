var mongo = require('mongodb');
var dbhost = '127.0.0.1'
var dbport = mongo.Connection.DEFAULT_PORT;
var ObjectID = mongo.ObjectID;
var db = new mongo.Db('node_blog', new mongo.Server(dbhost, dbport, {}));
var blogCollection;

db.open(function(error) {
	console.log('We are connected: ' + dbhost + ':' + dbport);

	db.collection('blogs', {strict: true}, function(error, collection) {
		blogCollection = collection;
		insertDB();
		if(error) {
			console.log('The blog collection doesnt exist, creating it with sample data...');
			insertDB()
		}
	});
});

var insertDB = function() {

    var blogs = [{author: 'blog author one', title: 'title one', blog: 'blog one', created_at: new Date(), comments: [{reader: 'blog reader one', comment: 'comment one', created_at: new Date()},
		{reader: 'blog reader two', comment: 'comment two', created_at: new Date()}]},
		{author:'blog author two', title: 'title two', blog: 'blog two', created_at: new Date(), comments: []},
		{author:'blog author three', title: 'title three', blog: 'blog three', created_at: new Date(), comments: []}];

    db.collection('blogs', function(err, collection) {
        blogCollection = collection;
        collection.insert(blogs, {safe:true}, function(err, result) {});
    });
};

var findAll = function(req, res) {
	console.log('Retrieving all blogs:');
	blogCollection.find().toArray(function(error, items) {
		res.render('index', {title: 'Blog', articles:items});
	});
};

var findById = function(req, res) {
	var id = req.params.id;
	console.log('Retrieving blog with id: ' + id);
	blogCollection.findOne({'_id': new ObjectID(id)}, function(error, item) {
		res.render('item', {title: item.title, item: item});
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
	
	blogCollection.insert(blog, {safe: true}, function(err, items) {
		if(err) {
			console.log('Error inserting blog: ' + '\n' + 'Error: ' + err);
		} else {
			console.log('Inserted blog successfully:');
			res.redirect('/blog');
		}
	});
};

var updateBlog = function(req, res) {
	var id = req.body._id;
	var comment;
	blogCollection.findOne({'_id': new ObjectID(id)}, function(err, item) {
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

		blogCollection.update({'_id': new ObjectID(id)}, blog, {safe: true}, function(err, intem) {
			if(err) {
				console.log('Error updating blog with: ' + id + '\n' + 'Error: ' + err);
			} else {
				console.log('Updated the blog with id: ' + id);
				res.redirect('/blog');
			}
		});
	});	
};

var update = function(req, res) {
	var id = req.params.id;
	console.log('updating blog with id: ' + id);
	blogCollection.findOne({'_id': new ObjectID(id)}, function(error, item) {
		res.render('update_blog', {title: item.title, item: item});
	});
};

var deleteBlog = function(req, res) {
	var id = req.body._id;
	blogCollection.remove({'_id': new ObjectID(id)}, {safe:true}, function(err, items) {
		if(err) {
			console.log('Error deleting blog with: ' + id + '\n' + 'Error: ' + err);
		} else {
			console.log('Deleted blog with id: ' + id);
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
	blogCollection.update({'_id': new ObjectID(id)}, {'$push': {comments: comment}}, function(err, item) {
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