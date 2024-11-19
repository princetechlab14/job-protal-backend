// models/EmployeeQuiz.js

module.exports = (sequelize, DataTypes) => {
  const EmployeeQuiz = sequelize.define("EmployeeQuiz", {
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ["employeeId", "quizId"],
      },
    ]
  });
  return EmployeeQuiz;
};
