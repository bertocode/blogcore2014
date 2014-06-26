
var models = require('../models');
var cloudinary = require('cloudinary');
var multiparty = require('multiparty');


// Tamaño maximo del fichero a subir.
const MAX_UPFILE_SIZE_KB = 500;

/*
*  Autoload: attachmentid.
*/
exports.load = function(req, res, next, id) {

   models.Attachment
        .find(id)
        .success(function(attachment) {
            if (attachment) {
                req.attachment = attachment;
                next();
            } else {
                req.flash('error', 'No existe ninguna imagen adjunta con id='+id+'.');
                next(new Error('No existe ninguna imagen adjunta con id='+id+'.'));
            }
        })
        .error(function(error) {
            next(error);
        });
};

//-----------------------------------------------------------

// GET /posts/33/attachments
exports.index = function(req, res, next) {

    models.Attachment
        .findAll({where: {PostId: req.post.id},
                  order: [['updatedAt','DESC']]})
        .success(function(attachments) {
               res.render('attachments/index', {
                   attachments: attachments,
                   post: req.post
               });
        })
        .error(function(error) {
            next(error);
        });
};


// GET /posts/33/attachments/new
exports.new = function(req, res, next) {
    
    res.render('attachments/new', {post: req.post});
};



// POST /posts/33/attachments
exports.create = function(req, res, next) {

    var valid_adjunto = false; // true si he subido una imagen aceptable.

    var form = new multiparty.Form();

    form.on('error', function(error) {
      next(error);
    });

    form.on('close', function() {
        if ( ! valid_adjunto) { // False: contesto yo al navegador.
            req.flash('error','No se ha aceptado la imagen adjuntada.');
            res.redirect('/posts/' + req.post.id );
        }
    });

    form.on('part', function(part) {

        if (part.filename) { // esta parte sube un fichero

            // Controlar tamaño maximo:
            if (part.byteCount > MAX_UPFILE_SIZE_KB*1024) {
                req.flash('error', 'Tamaño máximo permitido es '+
                      MAX_UPFILE_SIZE_KB+'KB.');
                part.resume(); // Emitir data y descartar contenido.
                return;
            }
            
            valid_adjunto = true; // Sera el callback de Cloudinary el que
                                  // enviara la respuesta al navegador. 

            var out_stream = cloudinary.uploader.upload_stream(function(result) {
                console.log(result);
                if (! result.error) {

                    var attachment = models.Attachment.build({
                          public_id: result.public_id,
                          url: result.url,
                          filename: part.filename,
                          mime: part.headers["content-type"],
                          PostId: req.post.id
                        });
            
                    attachment.save()
                       .success(function() {
                           req.flash('success', 'Adjunto subido con éxito.');
                           res.redirect('/posts/' + req.post.id );
                       })
                       .error(function(error) {
                           next(error);
                       });
                } else {
                  req.flash('error', result.error.message);
                  res.redirect('/posts/' + req.post.id );
                }
            });
            part.on('data', function(data) {out_stream.write(data);}) 
                .on('end',  function() {out_stream.end();})
                .on('error',function(error) {out_stream.end();})
        }
    });

    form.parse(req);
};


// DELETE /posts/33/attachments/66
exports.destroy = function(req, res, next) {

    // Borrar el fichero en Cloudinary.
    cloudinary.api.delete_resources(req.attachment.public_id,
                                    function(result) {});

    // Borrar entrada en la base de datos.
    req.attachment.destroy()
        .success(function() {
            req.flash('success', 'Adjunto eliminado con éxito.');
            res.redirect('/posts/' + req.post.id );
        })
        .error(function(error) {
            next(error);
        });
};

