module.exports = (sequelize, DataTypes) => {
  const Education = sequelize.define("Education", {
    university: {
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

  return Education;
};
