const employerRoutes = require("./employer-route");
const employeeRoutes = require("./employee-route");
const reviewRoutes = require("./review-route");
const jobsRoute = require("./job-route");
const quizRouter = require("./quiz-router");
const otherJobs = require("./other-job");
const otherJobApply = require("./other-job-apply");
const express = require("express");
const app = express();
// Routes
app.use("/employer", employerRoutes);
app.use("/jobs", jobsRoute);
app.use("/employee", employeeRoutes);
app.use("/reviews", reviewRoutes);
app.use("/quiz", quizRouter);
app.use("/other-jobs", otherJobs);
app.use("/other-job-apply", otherJobApply);
app.get("/job-slider", async (req, res) => {
  try {
    const otherJobs = [
      "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/174386320/original/47245c64e656a2423ed92bafcaeb23699af7d10f/ecommerce-website-woocommerce-astra-divi-woodmart-ocean-wp-flatsome-martfury.jpg",
      "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/250720075/original/f50d1989b21a07a21d2a5e5a18e935d8c7af3baa/create-amazon-affiliate-website.png",
      "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/294811299/original/5331ee1e51fa7c8cb01eb8649b97d4cd4e1db9c2/design-redesign-shopify-store-shopify-dropshipping-store-shopify-website.png",
      "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/306561093/original/7c3a47aab9df80821cc9a0e1013b1abef283b091/design-profitable-shopify-dropshipping-store-or-shopify-website.png"
    ];
    return res.status(200).json({
      success: true,
      data: otherJobs,
    });
  } catch (error) {
    console.error("Error retrieving job-slider:", error);
    sendErrorResponse(res, "Error retrieving job-slider", 500);
    return res.status(500).json({
      success: false,
      message,
    });
  }
});
module.exports = {
  apiRoutes: app,
};
