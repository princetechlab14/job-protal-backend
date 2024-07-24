module.exports = (sequelize, DataTypes) => {
  const Language = sequelize.define("Language", {
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    proficiency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Employees",
        key: "id",
      },
    },
  });
  return Language;
};
