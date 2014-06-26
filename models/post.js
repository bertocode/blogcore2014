
// Definicion del modelo Post:

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Post',
      { title: {
           type: DataTypes.STRING,
           validate: {
              notEmpty: {msg: "El campo del título no puede estar vacío"}
           }
        },
        body: {
           type: DataTypes.TEXT,
           validate: {
              notEmpty: {msg: "El cuerpo del post no puede estar vacío"}
           }
        }
      });
}
