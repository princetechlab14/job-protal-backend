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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shorting: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },
  });
  return OtherJobs;
};

