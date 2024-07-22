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
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true, // Allow null if the start date is not provided
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true, // Allow null if the end date is not provided
    },
  });
  return Experience;
};
