module.exports = (sequelize, DataTypes) => {
  const SavedJob = sequelize.define("SavedJob", {
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Employees",
        key: "id",
      },
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Jobs",
        key: "id",
      },
    },
  });

  return SavedJob;
};
