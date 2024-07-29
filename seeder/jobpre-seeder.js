const { JobPreferences } = require("../models");

const jobPreData = async () => {
  try {
    const insertRecords = [
      {
        jobTitles: ["Software Engineer", "Frontend Developer"],
        jobTypes: ["Full-time", "Remote"],
        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        shifts: ["Day", "Evening"],
        basePay: 55454,
        payType: "Per Month",
        readyToWork: true,
        employeeId: 1,
      },
      {
        jobTitles: ["Data Scientist", "Machine Learning Engineer"],
        jobTypes: ["Part-time"],
        workDays: ["Monday", "Wednesday", "Friday"],
        shifts: ["Flexible"],
        readyToWork: false,
        basePay: 55454,
        payType: "Per Month",
        employeeId: 2,
      },
      {
        jobTitles: ["Project Manager", "Product Manager"],
        jobTypes: ["Contract"],
        workDays: ["Monday", "Tuesday", "Thursday"],
        shifts: ["Day"],
        readyToWork: true,
        basePay: 55454,
        payType: "Per Month",
        employeeId: 44,
      },
      {
        jobTitles: ["UX Designer", "UI Designer"],
        jobTypes: ["Freelance"],
        workDays: ["Monday", "Tuesday"],
        shifts: ["Day", "Evening"],
        basePay: 55454,
        payType: "Per Month",
        readyToWork: true,
        employeeId: 43,
      },
    ];
    await JobPreferences.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { jobPreData };
