module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define("Skill", {
    skill: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    yearsOfExperience: {
      type: DataTypes.INTEGER,
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
  return Skill;
};
