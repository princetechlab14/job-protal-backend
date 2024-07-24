module.exports = (sequelize, DataTypes) => {
  const Resume = sequelize.define("Resumes", {
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cv: {
      type: DataTypes.TEXT("long"),
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
  return Resume;
};
