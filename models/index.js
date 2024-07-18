const { Sequelize, DataTypes } = require("sequelize");

// Using the connection URL directly
const sequelize = new Sequelize(
  "mysql://avnadmin:AVNS_ezymcMuAiILubl2YTel@mysql-148385bc-lipsatechlab-6210.c.aivencloud.com:21998/defaultdb?ssl-mode=REQUIRED",
  {
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
db.Job = require("./jobs")(sequelize, DataTypes);
db.Employer = require("./employer")(sequelize, DataTypes);
db.Employee = require("./employee")(sequelize, DataTypes);
db.SavedJob = require("./savedJob")(sequelize, DataTypes);
db.AppliedJob = require("./appliedJobs")(sequelize, DataTypes);

// relationship between jobs and employee
db.Employer.hasMany(db.Job, {
  foreignKey: "employeeId",
  as: "jobs", // Alias for the association
});
// Define associations
db.Employee.hasMany(db.SavedJob, { foreignKey: "employeeId" });
db.SavedJob.belongsTo(db.Employee, { foreignKey: "employeeId" });

db.Employee.hasMany(db.AppliedJob, { foreignKey: "employeeId" });
db.AppliedJob.belongsTo(db.Employee, {
  foreignKey: "employeeId",
  as: "employee",
});

db.SavedJob.belongsTo(db.Job, { foreignKey: "jobId", as: "job" });

db.AppliedJob.belongsTo(db.Job, { foreignKey: "jobId", as: "job" });
db.Job.belongsTo(db.Employer, { as: "employer", foreignKey: "employerId" });

module.exports = db;
