
// Definicion del modelo Attachment:

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Attachment',
    { public_id: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: { msg: "El campo public_id no puede estar vacío" }
            }
      },
      url: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: { msg: "El campo url no puede estar vacío" }
            }
      },
      filename: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: { msg: "El campo filename no puede estar vacío" }
            }
      },
      mime: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: { msg: "El campo mime no puede estar vacío" }
            }
      }
    });
}
