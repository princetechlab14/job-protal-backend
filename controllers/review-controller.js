const { Sequelize } = require("sequelize");
const { Review, Employer, Employee, Job } = require("../models"); // Adjust the path according to your setup
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/responseUtils");

// Controller to add a review
exports.addReview = async (req, res) => {
  const { employerId, comment, rating, description } = req.body;
  const { employeeId } = req.user;
  try {
    // Validate input
    if (!employerId || !comment || !rating || !role) {
      return sendErrorResponse(
        res,
        { message: "Missing required fields" },
        400
      );
    }

    // Create the review
    const review = await Review.create({
      employeeId,
      employerId,
      comment,
      rating,
      description,
    });

    sendSuccessResponse(res, { status: true, review });
  } catch (error) {
    console.error("Error adding review:", error);
    sendErrorResponse(res, { message: "Error adding review" }, 500);
  }
};

// Controller to delete a review
exports.deleteReview = async (req, res) => {
  const reviewId = req.params.id;

  try {
    // Validate input
    if (!reviewId) {
      return sendErrorResponse(res, { message: "Review ID is required" }, 400);
    }

    // Find and delete the review
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return sendErrorResponse(res, "Review not found", 404);
    }

    await review.destroy();
    sendSuccessResponse(res, { message: "Review deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting review:", error);
    sendErrorResponse(res, { message: "Error deleting review" }, 500);
  }
};

// get all employers
exports.getAllEmployers = async (req, res) => {
  try {
    const { companyName } = req.query;
    let whereClause = {
      status: true,
    };
    if (companyName) {
      whereClause.companyName = { [Sequelize.Op.like]: `%${companyName}%` };
    }
    // Fetch employers along with their reviews
    const employers = await Employer.findAll({
      where: whereClause,
      attributes: [
        "id",
        "companyName",
        "numberOfEmployees",
        "phoneNumber",
        "profile",
        [
          Sequelize.fn("COUNT", Sequelize.col("Reviews.id")),
          "totalReviewCount",
        ], // Total count of reviews
        [
          Sequelize.fn("AVG", Sequelize.col("Reviews.rating")),
          "averageReviewRating",
        ], // Average rating of reviews
      ],
      include: [
        {
          model: Review,
          attributes: [], // We don't need to fetch any specific attributes from Review
          as: "reviews",
        },
      ],
      group: ["Employer.id"], // Group by employer ID to calculate aggregate functions
    });

    // Format the result
    const formattedEmployers = employers.map((employer) => ({
      id: employer.id,
      companyName: employer.companyName,
      numberOfEmployees: employer.numberOfEmployees,
      phoneNumber: employer.phoneNumber,
      profile: employer.profile,
      totalReviewCount: Number(employer.getDataValue("totalReviewCount")),
      averageReviewRating: Number(
        Number(employer.getDataValue("averageReviewRating")).toFixed(1)
      ), // Formatting to 1 decimal place
    }));

    sendSuccessResponse(res, { employers: formattedEmployers });
  } catch (error) {
    console.error("Error retrieving employers:", error);
    sendErrorResponse(res, { message: "Internal server error" }, 500);
  }
};

// Controller to get all reviews by employerId
exports.getReviewsByEmployerId = async (req, res) => {
  const employerId = req.params.id;

  try {
    // Validate input
    if (!employerId) {
      return sendErrorResponse(
        res,
        { message: "Employer ID is required" },
        400
      );
    }
    const jobs = await Job.findAll({
      where: { employerId },
    });

    // Fetch reviews with detailed information
    const reviews = await Review.findAll({
      where: { employerId },
      attributes: [
        "id",
        "employeeId",
        "comment",
        "rating",
        "description",
        "createdAt",
      ],
      include: [
        {
          model: Employee,
          attributes: ["id", "firstName", "lastName", "email", "role", "city"], // Add more employee attributes as needed
          as: "employee",
        },
      ],
    });

    // Fetch company details
    const employer = await Employer.findOne({
      where: { id: employerId },
      attributes: ["id", "companyName", "profile"],
    });

    // Aggregate statistics
    const reviewStats = reviews.reduce(
      (stats, review) => {
        let roundedRating = Math.floor(review.rating); // Round down to the nearest whole number
        if (review.rating >= roundedRating + 0.5) {
          roundedRating += 1; // Round up if the rating is 0.5 or more above the whole number
        }

        stats.totalReviewCount += 1;
        stats.averageReviewRating += review.rating;

        switch (roundedRating) {
          case 1:
            stats.ratingCount1 += 1;
            break;
          case 2:
            stats.ratingCount2 += 1;
            break;
          case 3:
            stats.ratingCount3 += 1;
            break;
          case 4:
            stats.ratingCount4 += 1;
            break;
          case 5:
            stats.ratingCount5 += 1;
            break;
          default:
            break;
        }

        return stats;
      },
      {
        totalReviewCount: 0,
        averageReviewRating: 0,
        ratingCount1: 0,
        ratingCount2: 0,
        ratingCount3: 0,
        ratingCount4: 0,
        ratingCount5: 0,
      }
    );

    // Calculate average rating
    reviewStats.averageReviewRating =
      reviewStats.totalReviewCount > 0
        ? Number(
            (
              reviewStats.averageReviewRating / reviewStats.totalReviewCount
            ).toFixed(1)
          )
        : 0;

    // Parse JSON fields for each job
    jobs.forEach((job) => {
      job.jobTypes = JSON.parse(job.jobTypes);
      job.skills = JSON.parse(job.skills);
      job.languages = JSON.parse(job.languages);
      job.education = JSON.parse(job.education);
    });

    sendSuccessResponse(res, {
      employer,
      reviews,
      reviewStats,
      jobs,
    });
  } catch (error) {
    console.error("Error retrieving reviews:", error);
    sendErrorResponse(res, { message: "Internal server error" }, 500);
  }
};

// get all reviews by employee
exports.getAllReviewsByEmployeeId = async (req, res) => {
  const { employeeId } = req.user;

  try {
    // Validate input
    if (!employeeId) {
      return sendErrorResponse(
        res,
        { message: "Employee ID is required" },
        400
      );
    }
    const allReviews = await Employee.findAll({
      where: { id: employeeId },
      include: [
        {
          model: Review,
          as: "reviews",
          attributes: ["id", "description", "rating", "createdAt"],
          include: [
            {
              model: Employer,
              attributes: ["id", "fullName", "profile"],
              as: "employer",
            },
          ],
        },
      ],
    });
    sendSuccessResponse(res, {
      allReviews,
    });
  } catch (error) {
    console.error("Error retrieving reviews:", error);
    sendErrorResponse(res, { message: "Internal server error" }, 500);
  }
};
