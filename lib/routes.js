var lib = require('./lib');

module.exports = {
	signup: function(req, res) {
		lib.createUser(req.body.username
			, req.body.email
			, req.body.password, function(err, user) {
//				console.log(user);
//				res.redirect('/portfolio');
				res.redirect('/');
		});
	},
	getUser: function(req, res) {
		lib.getUser(req.params.username, function(err, user) {
			if (user)
				res.send('1');
			else
				res.send('0');
		});
	},
	login: function(req, res) {
		lib.authenticate(req.body.username
			, req.body.password, function(err, id) {
				if (id) {
					req.session._id = id;
					req.session.username = req.body.username;
					//res.redirect('/portfolio');
					res.redirect('/');
				}
				else
					res.redirect('/');
		});
	}
}