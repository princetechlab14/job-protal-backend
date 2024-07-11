module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define("Job", {
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jobLocation: {
      type: DataTypes.ENUM("On-site", "Remote"),
      allowNull: false,
    },
    employerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    specificCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    advertiseCity: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: false,
      defaultValue: "No", // Default value set to "No"
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    streetAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jobTypes: {
      type: DataTypes.JSON(
        DataTypes.ENUM(
          "Full-time",
          "Permanent",
          "Fresher",
          "Part-time",
          "Internship",
          "Temporary",
          "Freelance",
          "Volunteer"
        )
      ),
      allowNull: false,
    },
    minimumPay: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maximumPay: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    payType: {
      type: DataTypes.ENUM("Exact amount", "Range"),
      allowNull: true,
    },
    exactPay: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    payRate: {
      type: DataTypes.ENUM("per hour", "per day", "per month", "per year"),
      allowNull: true,
    },
    jobDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    numberOfPeople: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    deadline: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: false,
      defaultValue: "No",
    },
    deadlineDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Open", "Paused", "Closed"),
      allowNull: false,
      defaultValue: "Open",
    },
  });

  return Job;
};
