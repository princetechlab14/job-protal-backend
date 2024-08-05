const { Op, Sequelize, JSON } = require("sequelize");
const {
  Employee,
  SavedJob,
  Job,
  AppliedJob,
  Employer,
  Experience,
  Education,
  Skill,
  Language,
  JobPreferences,
  Resume,
  Review,
} = require("../models");
const {
  hashPassword,
  comparePassword,
  generateJWTToken,
} = require("../utils/passwordUtils");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");
const { registerSchema } = require("../validators/employeeValidation");
const { ensureEmployee } = require("../middleware/ensureEmployee");
const s3 = require("../utils/aws-config");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const ejs = require("ejs");
const path = require("path");
const nodemailer = require("nodemailer");

// Register new employee or login
exports.registerOrLoginEmployee = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return sendErrorResponse(
        res,
        error.details.map((err) => err.message).join(", "),
        400
      );
    }

    const { email, password } = value;

    const existingEmployee = await Employee.findOne({
      where: { email, status: true },
    });
    if (existingEmployee) {
      const isPasswordValid = await comparePassword(
        password,
        existingEmployee.password
      );
      if (!isPasswordValid) {
        return sendErrorResponse(res, "Invalid password", 400);
      }

      const token = await generateJWTToken({
        employeeId: existingEmployee.id,
        userType: "employee",
      });

      return sendSuccessResponse(
        res,
        {
          message: "Logged in successfully",
          userType: "employee",
          employee: existingEmployee,
          token,
        },
        200
      );
    }

    const hashedPassword = await hashPassword(password);

    const newEmployee = await Employee.create({
      ...value,
      password: hashedPassword,
    });

    const token = await generateJWTToken({
      employeeId: newEmployee.id,
      userType: "employee",
    });

    sendSuccessResponse(
      res,
      {
        message: "Registered successfully",
        userType: "employee",
        employee: newEmployee,
        token,
      },
      201
    );
  } catch (error) {
    console.error("Error registering or logging in employee:", error);
    sendErrorResponse(res, "Error registering or logging in employee", 500);
  }
};

// Update employee profile
exports.updateProfile = [
  ensureEmployee,
  async (req, res) => {
    try {
      const value = req.body;
      const { employeeId } = req.user;
      const imgUrl = req.body.imageUrl;
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        return sendErrorResponse(res, { message: "Employee not found" }, 404);
      }

      // Update only the fields provided in the request body
      Object.keys(value).forEach((key) => {
        if (value[key] !== "") employee[key] = value[key];
      });

      if (employee.profile) {
        const oldKey = employee.profile.split("/").pop();
        if (oldKey !== req.body.fileName) {
          // Extract file name from S3 URL
          const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `images/${oldKey}`,
          };
          try {
            await s3.send(new DeleteObjectCommand(deleteParams));
            console.log("Delete successfully");
          } catch (deleteError) {
            console.error("Error deleting old resume from S3:", deleteError);
            return res.status(500).send("Error deleting old Image from S3");
          }
        }
      }
      employee.profile = imgUrl ? imgUrl : employee.profile;
      await employee.save();

      sendSuccessResponse(res, { employee }, 200);
    } catch (error) {
      console.error("Error updating employee profile:", error);
      sendErrorResponse(res, "Error updating employee profile" + error, 500);
    }
  },
];

// get employee profile
exports.getProfile = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;

      // Fetch employee with associated data
      const employee = await Employee.findByPk(employeeId, {
        include: [
          {
            model: Experience,
            as: "experiences",
          },
          {
            model: Education,
            as: "educations",
          },
          {
            model: Skill,
            as: "skills",
          },
          {
            model: Language,
            as: "languages",
          },
          {
            model: JobPreferences,
            as: "jobPreferences",
          },
          {
            model: Resume,
            as: "resume",
          },
        ],
      });

      if (!employee) {
        return sendErrorResponse(res, "Employee not found", 404);
      }

      // Parse jobPreferences data
      if (process.env.DEV_TYPE === "local") {
        if (employee.jobPreferences) {
          employee.jobPreferences.jobTitles = JSON.parse(
            employee.jobPreferences.jobTitles
          );
          employee.jobPreferences.jobTypes = JSON.parse(
            employee.jobPreferences.jobTypes
          );
          employee.jobPreferences.workDays = JSON.parse(
            employee.jobPreferences.workDays
          );
          employee.jobPreferences.shifts = JSON.parse(
            employee.jobPreferences.shifts
          );
        }
      }

      // Extract the first resume
      const firstResume =
        employee.resume && employee.resume.length > 0
          ? {
              id: employee.resume[0].id,
              fileName: employee.resume[0].fileName,
              cv: employee.resume[0].cv,
              employeeId: employee.resume[0].employeeId,
              createdAt: employee.resume[0].createdAt,
              updatedAt: employee.resume[0].updatedAt,
            }
          : null;

      // Attach the first resume directly to the employee object
      employee.dataValues.resume = firstResume;

      sendSuccessResponse(
        res,
        {
          employee,
        },
        200
      );
    } catch (error) {
      console.error("Error fetching employee profile:", error);
      sendErrorResponse(res, "Error fetching employee profile", 500);
    }
  },
];

// Save a job
exports.saveJob = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const { jobId } = req.body;
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        return sendErrorResponse(res, "Employee not found", 404);
      }
      const job = await Job.findByPk(jobId);
      if (!job) {
        return sendErrorResponse(res, "Job not found", 404);
      }

      const existingSavedJob = await SavedJob.findOne({
        where: { employeeId, jobId },
      });
      if (existingSavedJob) {
        return sendErrorResponse(res, "Job already saved", 400);
      }

      const savedJob = await SavedJob.create({
        employeeId,
        jobId,
      });

      sendSuccessResponse(res, { savedJob }, 201);
    } catch (error) {
      console.error("Error saving job:", error);
      sendErrorResponse(res, "Error saving job" + error, 500);
    }
  },
];

// Apply for a job
exports.applyJob = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const { jobId, jobTitle, companyName, availableDates, experience } =
        req.body;

      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        return sendErrorResponse(res, "Employee not found", 404);
      }
      const job = await Job.findByPk(jobId, {
        include: [{ model: Employer, as: "employer" }], // Assuming the Job model is associated with Employer
      });
      if (!job) {
        return sendErrorResponse(res, "Job not found", 404);
      }

      const existingAppliedJob = await AppliedJob.findOne({
        where: { employeeId, jobId },
      });

      if (existingAppliedJob) {
        return sendErrorResponse(res, "Job already applied for", 400);
      }

      const appliedJob = await AppliedJob.create({
        employeeId,
        jobId,
        jobTitle,
        companyName,
        availableDates,
        experience,
      });

      // Send email to the employer
      const employerEmail = job.email; // Assuming employer has an email attribute
      await sendApplicationEmail(employerEmail, employee, job);

      sendSuccessResponse(res, { appliedJob }, 201);
    } catch (error) {
      console.error("Error applying for job:", error);
      sendErrorResponse(res, "Error applying for job", 500);
    }
  },
];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "thelipsasavaliya123@gmail.com",
    pass: "kskd egvv rqiu wago",
  },
});

const sendApplicationEmail = async (to, employee, job) => {
  try {
    const templatePath = path.join(__dirname, "emailTemplate.ejs");
    const html = await ejs.renderFile(templatePath, {
      name: job.employer.fullName,
      confirmationLink: "https://example.com/confirm", // Replace with relevant data
      employeeName: employee.firstName,
      jobTitle: job.jobTitle,
    });

    const mailOptions = {
      from: "thelipsasavaliya123@gmail.com",
      to,
      subject: "New Job Application",
      html: html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Application email sent to employer.");
    return;
  } catch (error) {
    console.error("Error sending application email:", error);
  }
};

// Update employee status for an applied job
exports.updateEmployeeStatus = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { appliedJobId } = req.params;
      const { employeeStatus } = req.body;
      if (!employeeStatus) {
        return sendErrorResponse(res, "Employee status is required", 400);
      }
      const appliedJob = await AppliedJob.findByPk(appliedJobId);
      if (!appliedJob) {
        return sendErrorResponse(res, "Applied job not found", 404);
      }

      await appliedJob.update({ employeeStatus });

      sendSuccessResponse(res, { appliedJob }, 200);
    } catch (error) {
      console.error("Error updating employee status:", error);
      sendErrorResponse(res, "Error updating employee status", 500);
    }
  },
];

// Remove applied job
exports.removeAppliedJob = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { appliedJobId } = req.params;

      const appliedJob = await AppliedJob.findByPk(appliedJobId);
      if (!appliedJob) {
        return sendErrorResponse(res, "Applied job not found", 404);
      }

      await appliedJob.destroy();

      sendSuccessResponse(
        res,
        { message: "Applied job removed successfully" },
        200
      );
    } catch (error) {
      console.error("Error removing applied job:", error);
      sendErrorResponse(res, "Error removing applied job", 500);
    }
  },
];

// Get all applied jobs by employee
exports.getAllAppliedJobs = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const { limit = 10, offset = 0, whereClause = {} } = req.query;

      // Get the count of all jobs based on the whereClause
      const count = await Job.count({
        where: whereClause,
        include: [
          {
            model: Employer,
            as: "employer",
          },
        ],
        distinct: true,
        col: "id",
      });

      // Fetch the applied jobs with the included models
      const appliedJobs = await AppliedJob.findAll({
        where: { employeeId },
        attributes: [
          "id",
          "applicationDate",
          "employeeStatus",
          "employerStatus",
        ],
        include: [
          {
            model: Job,
            as: "job",
            attributes: [
              "id",
              "jobTitle",
              "jobLocation",
              "employerId",
              "specificCity",
              "advertiseCity",
              "city",
              "state",
              "area",
              "pincode",
              "streetAddress",
              "jobTypes",
              "education",
              "skills",
              "languages",
              "minimumPay",
              "maximumPay",
              "payType",
              "exactPay",
              "payRate",
              "jobDescription",
              "numberOfPeople",
              "mobileNumber",
              "email",
              "deadline",
              "deadlineDate",
              "status",
              "experience",
              "createdAt",
              "updatedAt",
            ],
            include: [
              {
                model: Employer,
                as: "employer",
                attributes: ["id", "companyName"],
                include: [
                  {
                    model: Review,
                    as: "reviews",
                    attributes: ["rating"],
                  },
                ],
              },
            ],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // Manually calculate the average review rating for each job
      const appliedJobData = await Promise.all(
        appliedJobs.map(async (appliedJob) => {
          const job = appliedJob.job;
          if (job) {
            if (process.env.DEV_TYPE === "local") {
              job.jobTypes = JSON.parse(job.jobTypes);
              job.skills = JSON.parse(job.skills);
              job.languages = JSON.parse(job.languages);
              job.education = JSON.parse(job.education);
            }
            // Calculate the average review rating
            const reviews = job.employer.reviews || [];
            const averageReviewRating = reviews.length
              ? reviews.reduce((acc, review) => acc + review.rating, 0) /
                reviews.length
              : null;

            return {
              ...appliedJob.toJSON(),
              job: {
                ...job.toJSON(),
                employer: {
                  ...job.employer.toJSON(),
                  averageReviewRating,
                },
              },
            };
          }
          return appliedJob.toJSON();
        })
      );

      // Respond with the data and count
      sendSuccessResponse(
        res,
        {
          appliedJobs: appliedJobData,
          totalPages: Math.ceil(count / parseInt(limit)),
          currentPage: Math.floor(offset / parseInt(limit)) + 1,
        },
        200
      );
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      sendErrorResponse(res, "Error fetching applied jobs", 500);
    }
  },
];

// Get all saved jobs by employee
exports.getAllSavedJobs = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const { limit = 10, offset = 0 } = req.query;

      // Get the count of all saved jobs based on the whereClause
      const count = await SavedJob.count({
        where: { employeeId },
        include: [
          {
            model: Job,
            as: "job",
            include: {
              model: Employer,
              as: "employer",
            },
          },
        ],
        distinct: true,
        col: "id",
      });

      // Fetch the saved jobs with the included models
      const savedJobs = await SavedJob.findAll({
        where: { employeeId },
        attributes: ["id", "createdAt"],
        include: [
          {
            model: Job,
            as: "job",
            attributes: [
              "id",
              "jobTitle",
              "jobLocation",
              "employerId",
              "specificCity",
              "advertiseCity",
              "city",
              "state",
              "area",
              "pincode",
              "streetAddress",
              "jobTypes",
              "education",
              "skills",
              "languages",
              "minimumPay",
              "maximumPay",
              "payType",
              "exactPay",
              "payRate",
              "jobDescription",
              "numberOfPeople",
              "mobileNumber",
              "email",
              "deadline",
              "deadlineDate",
              "status",
              "experience",
              "createdAt",
              "updatedAt",
            ],
            include: [
              {
                model: Employer,
                as: "employer",
                attributes: ["id", "companyName"],
                include: [
                  {
                    model: Review,
                    as: "reviews",
                    attributes: ["rating"],
                  },
                ],
              },
            ],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // Manually calculate the average review rating for each job
      const savedJobData = await Promise.all(
        savedJobs.map(async (savedJob) => {
          const job = savedJob.job;
          if (job) {
            if (process.env.DEV_TYPE === "local") {
              job.jobTypes = JSON.parse(job.jobTypes);
              job.skills = JSON.parse(job.skills);
              job.languages = JSON.parse(job.languages);
              job.education = JSON.parse(job.education);
            }
            // Calculate the average review rating
            const reviews = job.employer.reviews || [];
            const averageReviewRating = reviews.length
              ? reviews.reduce((acc, review) => acc + review.rating, 0) /
                reviews.length
              : null;

            return {
              ...savedJob.toJSON(),
              job: {
                ...job.toJSON(),
                employer: {
                  ...job.employer.toJSON(),
                  averageReviewRating,
                },
              },
            };
          }
          return savedJob.toJSON();
        })
      );

      // Respond with the data and count
      sendSuccessResponse(
        res,
        {
          savedJobs: savedJobData,
          totalPages: Math.ceil(count / parseInt(limit)),
          currentPage: Math.floor(offset / parseInt(limit)) + 1,
        },
        200
      );
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      sendErrorResponse(res, "Error fetching saved jobs", 500);
    }
  },
];

// get average salary
exports.getFilteredJobsWithSalary = [
  async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default page is 1, limit is 10 per page
    const { jobTitle, location } = req.body;
    const offset = (Number(page) - 1) * Number(limit);

    // Construct the where clause for filtering
    const whereClause = {
      status: "Open", // Filter by status = "Open"
    };

    // Filter by jobTitle with partial matching
    if (jobTitle) {
      whereClause[Op.and] = Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("jobTitle")),
        "LIKE",
        `%${jobTitle.toLowerCase()}%`
      );
    }

    // Filter by location (city or state)
    if (location) {
      whereClause[Op.and] = [
        Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("city")),
          "LIKE",
          `%${location.toLowerCase()}%`
        ),
      ];
    }

    try {
      // Retrieve jobs based on the where clause
      const { count, rows: jobs } = await Job.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Employer,
            as: "employer",
            attributes: ["id", "companyName"],
          },
        ],
      });
      if (process.env.DEV_TYPE === "local") {
        // Parse JSON fields for each job
        jobs.forEach((job) => {
          job.jobTypes = JSON.parse(job.jobTypes);
          job.skills = JSON.parse(job.skills);
          job.languages = JSON.parse(job.languages);
          job.education = JSON.parse(job.education);
        });
      }

      // Extract salaries from jobs
      const salaries = jobs
        .map((job) => {
          if (job.payType === "Range") {
            return job.minimumPay;
          } else if (job.payType === "Exact amount") {
            return job.exactPay;
          }
          return 0;
        })
        .filter((salary) => salary > 0);

      // If there are no valid salaries, handle accordingly
      if (salaries.length === 0) {
        return sendSuccessResponse(res, {
          jobs,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          averageSalary: {
            yearly: 0,
            monthly: 0,
            weekly: 0,
            daily: 0,
            hourly: 0,
          },
        });
      }

      // Sort salaries to find the median
      salaries.sort((a, b) => a - b);

      // Find the median salary
      const middle = Math.floor(salaries.length / 2);
      const medianSalary =
        salaries.length % 2 !== 0
          ? salaries[middle]
          : (salaries[middle - 1] + salaries[middle]) / 2;

      // Convert the median salary to different time rates
      const averageYearly = medianSalary * 12; // 12 months in a year
      const averageMonthly = Number(medianSalary);
      const averageWeekly = medianSalary / 4; // Rough estimate of weeks in a month
      const averageDaily = medianSalary / 30; // Approximate number of days in a month
      const averageHourly = medianSalary / (30 * 8); // Approximate working hours in a month (8 hours/day * 30 days)

      // Construct pagination metadata
      const totalPages = Math.ceil(count / limit);
      const currentPage = parseInt(page);

      sendSuccessResponse(res, {
        jobs,
        totalPages,
        currentPage,
        averageSalary: {
          yearly: Number(averageYearly.toFixed(2)),
          monthly: Number(averageMonthly.toFixed(2)),
          weekly: Number(averageWeekly.toFixed(2)),
          daily: Number(averageDaily.toFixed(2)),
          hourly: Number(averageHourly.toFixed(2)),
        },
      });
    } catch (error) {
      console.error("Error retrieving jobs:", error);
      sendErrorResponse(res, "Error retrieving jobs", 500);
    }
  },
];

// Unsaved a job
exports.unsavedJob = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const { jobId } = req.params;

      const savedJob = await SavedJob.findOne({
        where: { employeeId, jobId },
      });
      if (!savedJob) {
        return sendErrorResponse(res, "Saved job not found", 404);
      }

      await savedJob.destroy();

      sendSuccessResponse(res, { message: "Job unsaved successfully" }, 200);
    } catch (error) {
      console.error("Error unsaving job:", error);
      sendErrorResponse(res, "Error unsaving job", 500);
    }
  },
];

// Get all unique skills from jobs
exports.getAllSkills = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      attributes: ["skills"],
    });
    // Extract and combine all skills
    const allSkills = jobs.reduce((acc, job) => {
      if (job.skills) {
        return acc.concat(
          process.env.DEV_TYPE === "local" ? JSON.parse(job.skills) : job.skills
        );
      }
      return acc;
    }, []);

    // Create unique skills and assign IDs
    const uniqueSkillsMap = new Map();
    allSkills.forEach((skill, index) => {
      if (!uniqueSkillsMap.has(skill)) {
        uniqueSkillsMap.set(skill, index + 1); // Start IDs from 1
      }
    });

    // Transform map to the desired format
    const options = Array.from(uniqueSkillsMap, ([label, id]) => ({
      id,
      label,
    }));

    const response = {
      id: 9,
      label: "Skill",
      key: "skills",
      options,
    };

    sendSuccessResponse(res, response, 200);
  } catch (error) {
    console.error("Error retrieving skills:", error);
    sendErrorResponse(res, "Error retrieving skills", 500);
  }
};

//  update resume
exports.addOrUpdateResume = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user; // Assumes employee ID is available from authenticated user
      const { cvBase64: cv, fileName } = req.body;

      // Check if a resume already exists for this employee
      const existingResume = await Resume.findOne({ where: { employeeId } });

      if (existingResume) {
        // Delete the old resume from S3
        if (existingResume.cv) {
          const oldKey = existingResume.cv.split("/").pop();
          if (oldKey !== fileName) {
            // Extract file name from S3 URL
            const deleteParams = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: `resumes/${oldKey}`,
            };
            try {
              await s3.send(new DeleteObjectCommand(deleteParams));
              console.log("Delete successfully");
            } catch (deleteError) {
              console.error("Error deleting old resume from S3:", deleteError);
              return res
                .status(500)
                .send("Error deleting old resume from S3" + deleteError);
            }
          }
        }

        // Update existing resume
        existingResume.fileName = fileName;
        existingResume.cv = cv;
        await existingResume.save();
        sendSuccessResponse(res, existingResume, 200);
        const response = {
          message: "Resume updated successfully",
          fileName: fileName,
          cv: cv,
        };
        sendSuccessResponse(res, response, 200);
      } else {
        // Add new resume
        const newResume = await Resume.create({
          fileName,
          cv,
          employeeId,
        });
        return sendSuccessResponse(
          res,
          { data: newResume, message: "Resume created successfully" },
          201
        );
      }
    } catch (error) {
      console.error("Error adding or updating resume:", error);
      return sendErrorResponse(res, "Error adding or updating resume", 500);
    }
  },
];

exports.deleteResume = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user; // Assumes employee ID is available from authenticated user

      // Check if a resume exists for this employee
      const existingResume = await Resume.findOne({ where: { employeeId } });

      if (!existingResume) {
        return sendErrorResponse(res, "No resume found for this employee", 404);
      }

      // Delete the resume from S3
      if (existingResume.cv) {
        const oldKey = existingResume.cv.split("/").pop();

        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `resumes/${oldKey}`,
        };
        try {
          await s3.send(new DeleteObjectCommand(deleteParams));
          console.log("Resume deleted successfully from S3");
        } catch (deleteError) {
          console.error("Error deleting resume from S3:", deleteError);
          return sendErrorResponse(res, "Error deleting resume from S3", 500);
        }
      }

      // Delete the resume record from the database
      await existingResume.destroy();

      return sendSuccessResponse(
        res,
        { message: "Resume deleted successfully" },
        200
      );
    } catch (error) {
      console.error("Error deleting resume:", error);
      return sendErrorResponse(res, "Error deleting resume", 500);
    }
  },
];
