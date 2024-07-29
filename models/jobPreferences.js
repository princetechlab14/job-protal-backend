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
    basePay: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    payType: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "Per Month",
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
