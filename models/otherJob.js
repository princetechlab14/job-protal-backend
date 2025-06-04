module.exports = (sequelize, DataTypes) => {
  const OtherJobs = sequelize.define("OtherJobs", {
    otherCategoryId: {
      type: DataTypes.INTEGER,
      allow: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    short_desc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    employerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    shorting: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },
  });
  return OtherJobs;
};

