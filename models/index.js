const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
    logging: console.log, // Enable logging to console
  }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Optionally, you can test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Import models
db.Job = require("./jobs")(sequelize, DataTypes); // Assuming you have a file for employee model
db.Employer = require("./employer")(sequelize, DataTypes); // Assuming you have a file for employee model
db.Employee = require("./employee")(sequelize, DataTypes); // Assuming you have a file for employee model

// relationship between jobs and employee
db.Employer.hasMany(db.Job, {
  foreignKey: "employeeId",
  as: "jobs", // Alias for the association
});
module.exports = db;
