require("dotenv").config();
const cron = require("node-cron");
const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerConfig = require("./swaggerConfig"); // Adjust path as needed
const db = require("./models");
const { Op } = require("sequelize");

const app = express();
const port = process.env.PORT || 3000; // Use port from environment variables or default to 3000

// Middleware setup
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors());

// Importing routes
const { apiRoutes } = require("./routes/apis");
const adminRoutes = require("./routes/admin");

// Set up EJS view engine
app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", path.join(__dirname, "views"));

// Define routes
app.use("/api", apiRoutes);
app.use("/admin", adminRoutes);
app.use(
  "/api-docs",
  swaggerConfig.swaggerUi.serve,
  swaggerConfig.swaggerUi.setup(swaggerConfig.specs)
);
app.get("/", (req, res) => {
  res.send("This is job portal");
});

// Error handling middleware
process.on("unhandledRejection", (err) => {
  console.error("Unhandled promise rejection:", err);
});

// Synchronize and seed database
const synchronizeAndSeed = async () => {
  try {
    await db.sequelize.sync({ force: true }); // Sync models with the database and force re-creation of tables

    // // Import and execute all seeders
    await require("./seeder/employer-seeder").employeeData();
    await require("./seeder/employee-seeder").employeeData();
    await require("./seeder/job-seeder").JobData();
    await require("./seeder/saved-job-seeder").savedJobData();
    await require("./seeder/applied-jobs-seeder").applideData();
    await require("./seeder/education-seeder").educationData();
    await require("./seeder/education-seeder").educationData();
    await require("./seeder/exp-seeder").experienceData();
    await require("./seeder/lan-seeder").languageData();
    await require("./seeder/skill-seeder").skillData();
    await require("./seeder/jobpre-seeder").jobPreData();
    await require("./seeder/review-seeder").reviewData();

    console.log("Synchronization and seeding completed successfully!!");
  } catch (error) {
    console.error("Error during synchronization and seeding:", error);
  }
};
// synchronizeAndSeed()

// Define a cron job to run at 12:01 AM
cron.schedule("* * * * *", async () => {
  try {
    const currentDate = new Date();
    const jobsToUpdate = await db.Job.findAll({
      where: {
        status: "Open",
        deadlineDate: {
          [Op.lte]: currentDate, // Jobs where deadlineDate <= today
        },
      },
    });

    const promises = jobsToUpdate.map(async (job) => {
      await job.update({ status: "Closed" });
    });

    // Wait for all updates to complete
    await Promise.all(promises);

    console.log(`Job statuses updated for ${jobsToUpdate.length} jobs.`);
  } catch (error) {
    console.error("Error updating job statuses:", error);
  }
});

// Log when the cron job starts
console.log("Cron job scheduled to run at 12:01 AM");

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://192.168.29.62:${port}`);
});
