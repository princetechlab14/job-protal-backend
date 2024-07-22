module.exports = (sequelize, DataTypes) => {
  const Education = sequelize.define("Education", {
    levelOfEducation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fieldOfStudy: {
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

  return Education;
};
