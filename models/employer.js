// models/employee.js

module.exports = (sequelize, DataTypes) => {
  const Employer = sequelize.define("Employer", {
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    numberOfEmployees: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    howHeard: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hiringManager: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: true,
      defaultValue: "No", // Default value set to "No"
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return Employer;
};
