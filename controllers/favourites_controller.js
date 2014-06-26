var models = require('../models');

exports.index = function(req,res){

	models.Favourites.findAll(
		{ 
		where: { UserId: req.user.id,
				best: [4,5]},
		order: [['best', 'DESC'],
				[models.Post, 'updatedAt', 'DESC']],
		include: [{ model: models.Post,
					include:[{ model: models.User, as:'Author'}
							]
				  }

				 ]
		}).success(function(favourites){
			var posts = favourites.map(function(favourite){
				favourite.post.best = favourite.best;
				return favourite.post;
			});

			res.render('favourites/index', {
				posts:posts
			});
		})
		.error(function(error){
			next(error);
		});
};

exports.postFavourite = function(req, res, next){
	console.log(req.body);

	var newbest = req.body.best || 5;
	
	var redir ='/users/' + req.user.id + '/favourites';

	models.Favourites.
		findOrCreate({ UserId: req.user.id,
						PostId: req.post.id
					 },
					 {
					 	best: 5
					 })
		.success(function(favourite){
					 	favourite.best = newbest;
					 	favourite.save()

					 	.success(function(){
					 		req.flash('success', 'Favorito marcado con éxito');
					 		res.redirect(redir);
					 	})
					 	.error(function(error){
					 		next(error);
					 	});
		})
		.error(function(error){
		 	next(error);
		 });
};

exports.deleteFavourite = function(req, res){
	var redir ='/users/' + req.user.id + '/favourites';

	models.Favourites.find({ where: {
									UserId: req.user.id, 
									PostId: req.post.id
								}}).success(function(favourite){
									if(favourite){
										favourite.destroy().success(function(){
											req.flash('success', 'Favorito eliminado con éxito.');
											res.redirect(redir);
										})
										.error(function(error){
											next(error);
										});
									}

									
								});
							};