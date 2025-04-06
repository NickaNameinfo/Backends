const express = require("express");
const adController = require("./ad.controller");
const { sanitize } = require("../../../middleware/sanitizer");

const adRouter = express.Router();

// Get all ads
adRouter.route("/").get(sanitize(), adController.getAllAds);

// Get ad by ID
adRouter.route("/:id").get(sanitize(), adController.getAdById);

// Add new ad
adRouter.route("/create").post(sanitize(), adController.createAd);

// Update ad
adRouter.route("/update").post(sanitize(), adController.updateAd);

// Delete ad
adRouter.route("/delete/:id").delete(sanitize(), adController.deleteAd);

module.exports = { adRouter };
