
// Definicion del modelo Comment:

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Comment',
      { body: {
            type: DataTypes.TEXT,
            validate: {
                notEmpty: { msg: "El cuerpo del comentario no puede estar vacío" }
            }
        }
      });
}
