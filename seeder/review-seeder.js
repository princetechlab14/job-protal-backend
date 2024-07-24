const { Review } = require("../models");

const reviewData = async () => {
  try {
    const insertRecords = [
      {
        employeeId: 1,
        employerId: 1,
        comment: "Great work environment and supportive team.",
        rating: 4.5,
        description: "Dsadsadsadsadsadsa",
      },
      {
        employeeId: 2,
        employerId: 1,
        comment: "Excellent leadership and clear vision.",
        rating: 4.7,
        description: "Dsadsadsadsadsadsa",
      },
      {
        employeeId: 1,
        employerId: 2,
        comment: "Good opportunities for growth and development.",
        rating: 4.3,
        description: "Dsadsadsadsadsadsa",
      },
      {
        employeeId: 3,
        employerId: 2,
        comment: "Flexible working hours and good benefits.",
        rating: 4.6,
        description: "Dsadsadsadsadsadsa",
      },
      {
        employeeId: 2,
        employerId: 3,
        comment: "Challenging work but rewarding experience.",
        rating: 4.2,
        description: "Dsadsadsadsadsadsa",
      },
    ];
    await Review.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { reviewData };
