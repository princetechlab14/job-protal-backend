module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define("Roles", {
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  });
  return Roles;
};
