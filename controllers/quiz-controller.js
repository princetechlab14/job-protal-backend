const { Quiz, EmployeeQuiz, Sequelize } = require("../models");
const Joi = require("joi");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");
const { Op } = require("sequelize");

// Validation schema using Joi
const quizSchema = Joi.object({
  questions: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().required(),
        type: Joi.string().valid("Single", "Multiple").required(),
        options: Joi.array().items(Joi.string()).required(),
        rightAnswers: Joi.array().items(Joi.number()).required(),
      })
    )
    .required(),
  employerId: Joi.number().optional(),
  role: Joi.string().optional(),
  userRole: Joi.string().optional(),
  jobId: Joi.number().optional(),
  adminId: Joi.number().optional(),
});

const employeeQuizSchema = Joi.object({
  employeeId: Joi.number().required(),
  quizId: Joi.number().required(),
});

exports.getAllQuizzes = async (req, res) => {
  try {
    const { employeeId, userType } = req.user;
    if (!employeeId && userType != "employee") {
      return sendErrorResponse(res, "Employee ID is required.", 400);
    }
    const quizzes = await Quiz.findAll({
      where: {
        id: {
          [Op.notIn]: Sequelize.literal(`
            (SELECT quizId FROM EmployeeQuizzes WHERE employeeId = ${employeeId})
          `),
        },
      },
    });

    // Parse the 'questions' field if it's a string and in local development
    if (process.env.DEV_TYPE === "local") {
      const parsedQuizzes = quizzes.map((quiz) => {
        const quizData = quiz.toJSON();
        if (typeof quizData.questions === "string") {
          try {
            quizData.questions = JSON.parse(quizData.questions);
          } catch (error) {
            quizData.questions = quizData.questions; // Keep as string if parsing fails
          }
        }
        return quizData;
      });

      return sendSuccessResponse(res, parsedQuizzes);
    }

    sendSuccessResponse(res, quizzes);
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);

    if (quiz) {
      const quizData = quiz.toJSON();

      // Convert to JSON and conditionally parse the 'questions' field
      if (
        process.env.DEV_TYPE === "local" &&
        typeof quizData.questions === "string"
      ) {
        try {
          quizData.questions = JSON.parse(quizData.questions);
        } catch (error) {
          quizData.questions = quizData.questions; // Keep as string if parsing fails
        }
      }

      sendSuccessResponse(res, quizData);
    } else {
      sendErrorResponse(res, "Quiz not found", 404);
    }
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

exports.createQuiz = async (req, res) => {
  const { error } = quizSchema.validate(req.body);
  if (error) return sendErrorResponse(res, error.details[0].message, 400);

  try {
    const quiz = await Quiz.create(req.body);
    sendSuccessResponse(res, quiz, 201);
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

exports.updateQuiz = async (req, res) => {
  const { error } = quizSchema.validate(req.body);
  if (error) return sendErrorResponse(res, error.details[0].message, 400);

  try {
    const [updated] = await Quiz.update(req.body, {
      where: { id: req.params.id },
    });

    if (updated) {
      const updatedQuiz = await Quiz.findByPk(req.params.id);

      sendSuccessResponse(res, updatedQuiz);
    } else {
      sendErrorResponse(res, "Quiz not found", 404);
    }
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const deleted = await Quiz.destroy({
      where: { id: req.params.id },
    });

    if (deleted) {
      sendSuccessResponse(res, { message: "Quiz deleted" });
    } else {
      sendErrorResponse(res, "Quiz not found", 404);
    }
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

exports.employeeQuiz = async (req, res) => {
  const { error } = employeeQuizSchema.validate(req.body);
  if (error) return sendErrorResponse(res, error.details[0].message, 400);

  try {
    const { employeeId, quizId } = req.body;
    const [record, created] = await EmployeeQuiz.findOrCreate({
      where: { employeeId, quizId },
      defaults: req.body,
    });
    if (created) {
      return res.json({
        success: true,
        message: "Employee quiz added successfully.",
      });
    } else {
      return res.status(409).json({
        success: false,
        message: "Employee quiz record already exists.",
      });
    }
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

