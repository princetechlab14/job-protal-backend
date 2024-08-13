// models/quiz.js

module.exports = (sequelize, DataTypes) => {
  const Quiz = sequelize.define("Quiz", {
    questions: {
      type: DataTypes.JSON, // Array of question objects
      allowNull: false,
    },
    employerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userRole: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  return Quiz;
};
