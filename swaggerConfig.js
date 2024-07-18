const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Job portal API Documentation",
      version: "1.0.0",
      description:
        "API documentation for your employer, jobs, and employee routes",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "apiKey",
          name: "authorization",
          scheme: "bearer",
          in: "header",
        },
      },
    },
    servers: [
      {
        url: "https://job-protal-backend.onrender.com/api", // Replace with your server URL
        description: "Local development server",
      },
    ],
  },
  apis: ["./routes/apis/*.js"], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
