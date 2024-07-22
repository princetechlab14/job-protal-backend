const { JobPreferences } = require("../models");

const jobPreData = async () => {
  try {
    const insertRecords = [
      {
        jobTitles: ["Software Engineer", "Frontend Developer"],
        jobTypes: ["Full-time", "Remote"],
        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        shifts: ["Day", "Evening"],
        readyToWork: true,
        employeeId: 1,
      },
      {
        jobTitles: ["Data Scientist", "Machine Learning Engineer"],
        jobTypes: ["Part-time"],
        workDays: ["Monday", "Wednesday", "Friday"],
        shifts: ["Flexible"],
        readyToWork: false,
        employeeId: 2,
      },
      {
        jobTitles: ["Project Manager", "Product Manager"],
        jobTypes: ["Contract"],
        workDays: ["Monday", "Tuesday", "Thursday"],
        shifts: ["Day"],
        readyToWork: true,
        employeeId: 44,
      },
      {
        jobTitles: ["UX Designer", "UI Designer"],
        jobTypes: ["Freelance"],
        workDays: ["Monday", "Tuesday"],
        shifts: ["Day", "Evening"],
        readyToWork: true,
        employeeId: 43,
      },
      {
        jobTitles: ["DevOps Engineer", "Site Reliability Engineer"],
        jobTypes: ["Full-time"],
        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        shifts: ["Night"],
        readyToWork: false,
        employeeId: 43,
      },
    ];
    await JobPreferences.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { jobPreData };
