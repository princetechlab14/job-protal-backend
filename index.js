require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000; // Use port from environment variables or default to 3000
const { apiRoutes } = require("./routes");
// Middleware setup
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// importing connection
const db = require("./models");
const synchronizeAndSeed = async () => {
  try {
    await db.sequelize.sync({ force: true }); // Sync models with the database and force re-creation of tables
    // Uncomment the line below if you don't want to force re-creation of tables
    // await db.sequelize.sync();

    // Import and execute all seeders
    await require("./seeder/employer-seeder").employeeData();
    await require("./seeder/employee-seeder").employeeData();
    await require("./seeder/job-seeder").JobData();

    console.log("Synchronization and seeding completed successfully!!");
  } catch (error) {
    console.error("Error during synchronization and seeding:", error);
  }
};
// synchronizeAndSeed()
// Routes
app.use("/api", apiRoutes);
app.get("/", (req, res) => {
  res.send("This is job portal ");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
