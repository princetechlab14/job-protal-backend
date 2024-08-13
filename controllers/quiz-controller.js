const { Quiz } = require("../models");
const Joi = require("joi");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

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

exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.findAll();

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
