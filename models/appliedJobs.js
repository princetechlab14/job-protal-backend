module.exports = (sequelize, DataTypes) => {
  const AppliedJob = sequelize.define("AppliedJob", {
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
    applicationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    employeeStatus: {
      type: DataTypes.ENUM(
        "Applied",
        "Interviewing",
        "Offer received",
        "Hired",
        "Not selected by employer",
        "No longer interested"
      ),
      allowNull: true,
      defaultValue: null,
    },
    employerStatus: {
      type: DataTypes.ENUM(
        "Applied",
        "Interviewing",
        "Offer received",
        "Hired",
        "Not selected by employer",
        "No longer interested"
      ),
      allowNull: false,
      defaultValue: "Applied",
    },
    cv: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    availableDates: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experience: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return AppliedJob;
};
