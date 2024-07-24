module.exports = (sequelize, DataTypes) => {
  const JobPreferences = sequelize.define("JobPreferences", {
    jobTitles: {
      type: DataTypes.JSON(DataTypes.STRING),
      allowNull: true,
    },
    jobTypes: {
      type: DataTypes.JSON(DataTypes.STRING),
      allowNull: true,
    },
    workDays: {
      type: DataTypes.JSON(DataTypes.STRING),
      allowNull: true,
    },
    shifts: {
      type: DataTypes.JSON(DataTypes.STRING),
      allowNull: true,
    },
    readyToWork: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
  return JobPreferences;
};
