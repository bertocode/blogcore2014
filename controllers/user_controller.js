
var models = require('../models');
var crypto = require('crypto');


/*
*  Autoloading :userid
*/
exports.load = function(req, res, next, id) {
   models.User
        .find(id)
        .success(function(user) {
            if (user) {
                req.user = user;
                next();
            } else {
                req.flash('error', 'No existe el usuario con id='+id+'.');
                next('No existe el usuario con id='+id+'.');
            }
        })
        .error(function(error) {
            next(error);
        });
};


/*
* Comprueba que el usuario logeado es el usuario alque se refiere esta ruta.
*/
exports.loggedUserIsUser = function(req, res, next) {
    
   if (req.session.user && req.session.user.id == req.user.id) {
      next();
   } else {
      console.log('Ruta prohibida: no soy el usuario logeado.');
      res.send(403);
   }
};

// ----------------------------------
// Rutas
// ----------------------------------

// GET /users
exports.index = function(req, res, next) {
    models.User
        .findAll({order: ['name']})
        .success(function(users) {
            res.render('users/index', {
                users: users
            });
        })
        .error(function(error) {
            next(error);
        });
};

// GET /users/33
exports.show = function(req, res, next) {
    res.render('users/show', {user: req.user});
};

// GET /users/new
exports.new = function(req, res, next) {

    var user = models.User.build(
        { login: 'Tu login',
          name:  'Tu nombre',
          email: 'Tu email'
        });
    
    res.render('users/new', {user: user,
                             validate_errors: {} });
};

// POST /users
exports.create = function(req, res, next) {

    var user = models.User.build(
        { login: req.body.user.login,
          name:  req.body.user.name,
          email: req.body.user.email
        });
    
    // El login debe ser unico:
    models.User.find({where: {login: req.body.user.login}})
        .success(function(existing_user) {
            if (existing_user) {
                console.log("Error: El usuario \""+ req.body.user.login +"\" ya existe: "+existing_user.values);
                req.flash('error', "Error: El usuario \""+ req.body.user.login +"\" ya existe.");
                res.render('users/new', { user: user,
                                          validate_errors: {
                                             login: 'El usuario \"'+ req.body.user.login +'\" ya existe.'
                                        }
                           });
            } else {
                var validate_errors = user.validate();
                if (validate_errors) {
                    console.log("Errores de validación:", validate_errors);
                    req.flash('error', 'Los datos del formulario son incorrectos.');
                    for (var err in validate_errors) {
                        req.flash('error', validate_errors[err]);
                    };
                    res.render('users/new', {user: user,
                                             validate_errors: validate_errors});
                    return;
                } 
                
                // El password no puede estar vacio
                if ( ! req.body.user.password) {
                    req.flash('error', 'El campo Password es obligatorio.');
                    res.render('users/new', {user: user,
                                             validate_errors: {
                                                 password: 'El campo Password es obligatorio.'}});
                    return;
                }

                user.salt = createNewSalt();
                user.hashed_password = encriptarPassword(req.body.user.password, user.salt);

                user.save()
                    .success(function() {
                        req.flash('success', 'Usuario creado con éxito.');
                        res.redirect('/users');
                    })
                    .error(function(error) {
                        next(error);
                    });
            }
        })
        .error(function(error) {
            next(error);
        });
};

// GET /users/33/edit
exports.edit = function(req, res, next) {

    res.render('users/edit', {user: req.user,
                              validate_errors: {} });
};

// PUT /users/33
exports.update = function(req, res, next) {
  
    // req.user.login = req.body.user.login;  // No se puede editar.
    req.user.name  = req.body.user.name;
    req.user.email = req.body.user.email;
    req.session.user.name = req.user.name;
    
    var validate_errors = req.user.validate();
    if (validate_errors) {
        console.log("Errores de validación:", validate_errors);

        req.flash('error', 'Los datos del formulario son incorrectos.');
        for (var err in validate_errors) {
            req.flash('error', validate_errors[err]);
        };

        res.render('users/edit', {user: req.user,
                                  validate_errors: validate_errors});
        return;
    } 
    
    var fields_to_update = ['name','email'];
    
    // ¿Cambio el password?
    if (req.body.user.password) {
        console.log('Hay que actualizar el password');
        req.user.salt = createNewSalt();
        req.user.hashed_password = encriptarPassword(req.body.user.password, 
                                                      req.user.salt);
        fields_to_update.push('salt');
        fields_to_update.push('hashed_password');
    }
    
    req.user.save(fields_to_update)
        .success(function() {
            req.flash('success', 'Usuario actualizado con éxito.');
            res.redirect('/users');
        })
        .error(function(error) {
            next(error);
        });
};

// DELETE /users/33
exports.destroy = function(req, res, next) {

    req.user.destroy()
        .success(function() {
            req.flash('success', 'Usuario eliminado con éxito.');
            res.redirect('/users');
        })
        .error(function(error) {
            next(error);
        });
};


// ----------------------------------
// Autenticacion
// ----------------------------------

/*
 * Crea un string aleatorio para usar como salt.
 */
function createNewSalt() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
};

/*
 * Encripta un password en claro.
 * Mezcla un password en claro con el salt proporcionado, ejecuta un SHA1 digest, 
 * y devuelve 40 caracteres hexadecimales.
 */
function encriptarPassword(password, salt) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
};

/*
 * Autenticar un usuario.
 *
 * Busca el usuario con el login dado en la base de datos y comprueba su password.
 * Si todo es correcto ejecuta callback(null,user).
 * Si la autenticación falla o hay errores se ejecuta callback(error).
 */
exports.autenticar = function(login, password, callback) {
    
    models.User.find({where: {login: login}})
        .success(function(user) {
            if (user) {
                console.log('Encontrado el usuario.');

                // if (user.hashed_password == "" && password == "") {
                //     callback(null,user);
                //     return;
                // }
                
                var hash = encriptarPassword(password, user.salt);
                
                if (hash === user.hashed_password) {
                    callback(null,user);
                    return;
                }
            }
            callback(new Error('Password erróneo.'));
        })
        .error(function(err) {
            next(err);
        });
}; 


