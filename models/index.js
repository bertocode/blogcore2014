
var path = require('path');

var Sequelize = require('sequelize');

// Configurar Sequelize para usar SQLite. Uso una expresion regular para extraer 
// los valores de acceso a la base de datos
var vals = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);

var DATABASE_PROTOCOL = vals[1];
var DATABASE_DIALECT = vals[1];
var DATABASE_USER = vals[2];
var DATABASE_PASSWORD = vals[3];
var DATABASE_HOST = vals[4];
var DATABASE_PORT = vals[5];
var DATABASE_NAME = vals[6];

var sequelize = new Sequelize(DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, 
            { dialect:  DATABASE_DIALECT, 
              protocol: DATABASE_PROTOCOL, 
              port:     DATABASE_PORT,
              host:     DATABASE_HOST,
              storage:  process.env.DATABASE_STORAGE,   // solo local en .env
              omitNull: true                            // para postgres
            });


// Importar la definicion de las clases.
// La clase Xxxx se importa desde el fichero xxxx.js.
var Post = sequelize.import(path.join(__dirname,'post'));
var User = sequelize.import(path.join(__dirname,'user'));
var Comment = sequelize.import(path.join(__dirname,'comment'));
var Attachment = sequelize.import(path.join(__dirname,'attachment'));
var Favourites = sequelize.import(path.join(__dirname,'favourites'));

// Relaciones

// La llamada User.hasMany(Post); 
//  - crea un atributo llamado UserId en el modelo de Post  
//  - y en el prototipo de User se crean los metodos getPosts, setPosts,
//    addPost, removePost, hasPost y hasPosts.
//
// Como el atributo del modelo Post que apunta a User se llama AuthorId 
// en vez de UserId, he añadido la opcion foreignKey.
User.hasMany(Post, {foreignKey: 'AuthorId'});


User.hasMany(Comment, {foreignKey: 'AuthorId'});
Post.hasMany(Comment);

Post.hasMany(Attachment);

// La llamada Post.belongsTo(User);
//  - crea en el modelo de Post un atributo llamado UserId,
//  - y en el prototipo de Post se crean los metodos getUser y setUser.
//
// Como el atributo del modelo Post que apunta a User se llama AuthorId 
// en vez de UserId, he añadido la opcion foreignKey.
// 
// Con el uso de la opcion "as" la relacion se llama Author, y los metodos
// de acceso creados son setAuthor y getAuthor. 
Post.belongsTo(User, {as: 'Author', foreignKey: 'AuthorId'});

Comment.belongsTo(User, {as: 'Author', foreignKey: 'AuthorId'});
Comment.belongsTo(Post);

Attachment.belongsTo(Post);

User.hasMany(Favourites);
Post.hasMany(Favourites);
Favourites.belongsTo(User);
Favourites.belongsTo(Post);

// Exportar los modelos:
exports.Post = Post;
exports.User = User;
exports.Comment = Comment;
exports.Attachment = Attachment;
exports.Favourites = Favourites;

// Crear las tablas en la base de datos que no se hayan creado aun.
// En un futuro lo haremos con migraciones.
sequelize.sync();
