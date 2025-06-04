module.exports = (sequelize, DataTypes) => {
  const OtherJobApply = sequelize.define("OtherJobApply", {
    otherJobId: {
      type: DataTypes.INTEGER,
      allow: true,
    },
    name: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: true,
    },
    mobile_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    job_title: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    job_name: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    income: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  });
  return OtherJobApply;
};

