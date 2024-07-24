module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define("Review", {
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Employees",
        key: "id",
      },
    },
    employerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Employers",
        key: "id",
      },
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
  return Review;
};
