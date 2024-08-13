// seeders/quizSeeder.js

const { Quiz } = require("../models");

const seedQuizzes = async () => {
  try {
    const quizzes = [
      {
        questions: [
          {
            question: "What is the capital of France?",
            type: "Single",
            options: ["Paris", "London", "Berlin", "Madrid"],
            rightAnswers: [0], // Index of correct answer
          },
          {
            question: "Which languages are considered programming languages?",
            type: "Multiple",
            options: ["English", "Spanish", "Python", "JavaScript"],
            rightAnswers: [2, 3], // Indices of correct answers
          },
          {
            question: "What is the currency of Japan?",
            type: "Single",
            options: ["Dollar", "Euro", "Yen", "Won"],
            rightAnswers: [2], // Index of correct answer
          },
          {
            question: "Select the primary colors.",
            type: "Multiple",
            options: ["Red", "Green", "Blue", "Yellow"],
            rightAnswers: [0, 2], // Indices of correct answers
          },
        ],
        employerId: null,
        userRole: "admin",
        jobId: null,
        role: "full stack",
        adminId: 1,
      },
      {
        questions: [
          {
            question: "What is the capital of Germany?",
            type: "Single",
            options: ["Berlin", "Munich", "Frankfurt", "Hamburg"],
            rightAnswers: [0], // Index of correct answer
          },
          {
            question: "Which of the following are fruits?",
            type: "Multiple",
            options: ["Apple", "Carrot", "Banana", "Potato"],
            rightAnswers: [0, 2], // Indices of correct answers
          },
        ],
        employerId: 2,
        userRole: "employer",
        jobId: 2,
        adminId: null,
      },
    ];

    await Quiz.bulkCreate(quizzes);
    console.log("Quiz seeder executed successfully.");
  } catch (error) {
    console.log("Quiz seeder error:", error);
  }
};

module.exports = { seedQuizzes };
