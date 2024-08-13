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
      acquire: 60000,
      idle: 20000,
      evict: 10000,
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
db.Job = require("./jobs")(sequelize, DataTypes);
db.Employer = require("./employer")(sequelize, DataTypes);
db.Employee = require("./employee")(sequelize, DataTypes);
db.SavedJob = require("./savedJob")(sequelize, DataTypes);
db.AppliedJob = require("./appliedJobs")(sequelize, DataTypes);
db.Experience = require("./experience")(sequelize, DataTypes);
db.Education = require("./education")(sequelize, DataTypes);
db.Skill = require("./skill")(sequelize, DataTypes);
db.Language = require("./language")(sequelize, DataTypes);
db.Resume = require("./Resume-model")(sequelize, DataTypes);
db.JobPreferences = require("./jobPreferences")(sequelize, DataTypes);
db.Review = require("./review")(sequelize, DataTypes);
db.Roles = require("./role")(sequelize, DataTypes);
db.Admin = require("./admin-model")(sequelize, DataTypes);
db.Quiz = require("./quize")(sequelize, DataTypes);

// Job and Employee relationships
db.Employer.hasMany(db.Job, {
  foreignKey: "employerId",
  as: "jobs",
});
db.Job.belongsTo(db.Employer, { as: "employer", foreignKey: "employerId" });

// Employee and SavedJob relationships
db.Employee.hasMany(db.SavedJob, { foreignKey: "employeeId" });
db.SavedJob.belongsTo(db.Employee, { foreignKey: "employeeId" });
db.SavedJob.belongsTo(db.Job, { foreignKey: "jobId", as: "job" });
db.Job.hasMany(db.Review, {
  foreignKey: "jobId", // Adjust if your key is different
  as: "ratings", // Alias for accessing ratings
});
// Employee and AppliedJob relationships
db.Employee.hasMany(db.AppliedJob, { foreignKey: "employeeId" });

db.AppliedJob.belongsTo(db.Job, { foreignKey: "jobId", as: "job" });
db.Job.hasMany(db.AppliedJob, { foreignKey: "jobId" });

// Experience, Education, Skill, Language relationships
db.Employee.hasMany(db.Experience, {
  foreignKey: "employeeId",
  as: "experiences",
});
db.Employee.hasMany(db.Education, {
  foreignKey: "employeeId",
  as: "educations",
});
db.Employee.hasMany(db.Skill, { foreignKey: "employeeId", as: "skills" });
db.Employee.hasMany(db.Language, { foreignKey: "employeeId", as: "languages" });
db.Employee.hasMany(db.Resume, { foreignKey: "employeeId", as: "resume" });
db.Employee.hasOne(db.JobPreferences, {
  foreignKey: "employeeId",
  as: "jobPreferences",
});

db.Employer.hasMany(db.Review, { foreignKey: "employerId", as: "reviews" });
db.Review.belongsTo(db.Employer, { foreignKey: "employerId", as: "employer" });
db.Review.belongsTo(db.Employee, { foreignKey: "employeeId", as: "employee" });
db.Employee.hasMany(db.Review, { foreignKey: "employeeId", as: "reviews" });
db.AppliedJob.belongsTo(db.Employee, {
  foreignKey: "employeeId",
  as: "employee",
});
db.Quiz.belongsTo(db.Job, {
  foreignKey: "jobId", // Adjust if your foreign key is named differently
  as: "job", // Alias for the association
});
module.exports = db;
