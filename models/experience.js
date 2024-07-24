module.exports = (sequelize, DataTypes) => {
  const Experience = sequelize.define("Experience", {
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyName: {
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
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isPresent: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  });
  return Experience;
};
