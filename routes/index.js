var express = require('express');
var router = express.Router();

var postController = require('../controllers/post_controller');
var userController = require('../controllers/user_controller');
var sessionController = require('../controllers/session_controller');
var commentController = require('../controllers/comment_controller');
var attachmentController = require('../controllers/attachment_controller');
var favouritesController = require('../controllers/favourites_controller');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

/* Rutas de sesiones */

router.get('/login',  sessionController.new); // obtener el formulario a rellenar para hacer login. 
router.post('/login', sessionController.create); // enviar formulario para crear la sesión.
router.get('/logout', sessionController.destroy); // destruir la sesión actual.

/* Autoloading */

router.param('postid', postController.load);  // autoload :postid
router.param('userid', userController.load); // autoload :userid
router.param('commentid', commentController.load); // autoload :commentid
router.param('attachmentid', attachmentController.load); // autoload :attachmentid

/* Rutas de las imagenes adjuntas */

router.get('/posts/:postid([0-9]+)/attachments', 
  attachmentController.index);

router.get('/posts/:postid([0-9]+)/attachments/new', 
  sessionController.loginRequired,
  postController.loggedUserIsAuthor,
  attachmentController.new);

router.post('/posts/:postid([0-9]+)/attachments', 
   sessionController.loginRequired,
   postController.loggedUserIsAuthor,
   attachmentController.create);

router.delete('/posts/:postid([0-9]+)/attachments/:attachmentid([0-9]+)', 
     sessionController.loginRequired,
     postController.loggedUserIsAuthor,
     attachmentController.destroy);

/* Rutas de Comentarios */

router.get('/posts/:postid([0-9]+)/comments', 
  commentController.index);

router.get('/posts/:postid([0-9]+)/comments/new', 
  sessionController.loginRequired,
  commentController.new);

router.get('/posts/:postid([0-9]+)/comments/:commentid([0-9]+)',
  commentController.show);

router.post('/posts/:postid([0-9]+)/comments', 
   sessionController.loginRequired,
   commentController.create);

router.get('/posts/:postid([0-9]+)/comments/:commentid([0-9]+)/edit', 
  sessionController.loginRequired,
  commentController.loggedUserIsAuthor,
  commentController.edit);

router.put('/posts/:postid([0-9]+)/comments/:commentid([0-9]+)', 
  sessionController.loginRequired,
  commentController.loggedUserIsAuthor,
  commentController.update);

router.delete('/posts/:postid([0-9]+)/comments/:commentid([0-9]+)', 
     sessionController.loginRequired,
     commentController.loggedUserIsAuthor,
     commentController.destroy);

/* Rutas de Posts */


router.get('/posts', sessionController.sessionExpired, postController.index);
router.get('/posts/new', sessionController.loginRequired, sessionController.sessionExpired, postController.new);
router.get('/posts/:postid([0-9]+)', sessionController.sessionExpired, postController.show);
router.post('/posts', sessionController.loginRequired, sessionController.sessionExpired, postController.create);
router.get('/posts/:postid([0-9]+)/edit',  sessionController.loginRequired, sessionController.sessionExpired,postController.loggedUserIsAuthor,
                                          postController.edit);
router.put('/posts/:postid([0-9]+)', sessionController.loginRequired, sessionController.sessionExpired, postController.loggedUserIsAuthor,
                                     postController.update);
router.delete('/posts/:postid([0-9]+)',  sessionController.loginRequired, sessionController.sessionExpired, postController.loggedUserIsAuthor, postController.destroy);
router.get('/posts/search', sessionController.sessionExpired, postController.search);
router.get('/posts/search?:q=(*)', sessionController.sessionExpired, postController.search);
router.get('/creditos', sessionController.sessionExpired, function(req,res,next) {
    res.render('creditos');
});

/* Rutas de Users */

router.get('/users', sessionController.sessionExpired, userController.index);
router.get('/users/new', sessionController.sessionExpired, userController.new);
router.get('/users/:userid([0-9]+)', sessionController.sessionExpired, userController.show);
router.post('/users', sessionController.sessionExpired, userController.create);
router.get('/users/:userid([0-9]+)/edit', sessionController.sessionExpired, sessionController.loginRequired,userController.loggedUserIsUser,
                                          userController.edit);
router.put('/users/:userid([0-9]+)', sessionController.sessionExpired, sessionController.loginRequired, userController.loggedUserIsUser,
                                     userController.update);
router.delete('/users/:userid([0-9]+)', sessionController.sessionExpired, sessionController.loginRequired, userController.loggedUserIsUser,
                                        userController.destroy);

/* Rutas de Favoritos*/
router.get('/users/:userid([0-9]+)/favourites', sessionController.sessionExpired, favouritesController.index );
router.put('/users/:userid([0-9]+)/favourites/:postid([0-9]+)', sessionController.loginRequired, sessionController.sessionExpired, favouritesController.postFavourite);
router.delete('/users/:userid([0-9]+)/favourites/:postid([0-9]+)', sessionController.loginRequired, sessionController.sessionExpired, userController.loggedUserIsUser, favouritesController.deleteFavourite);

module.exports = router;
