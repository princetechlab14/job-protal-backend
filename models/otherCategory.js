module.exports = (sequelize, DataTypes) => {
  const OtherCategory = sequelize.define("OtherCategory", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shorting: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },
  });
  return OtherCategory;
};

