const express = require("express");
const {
  createLocation,
  getLocations,
  updateLocation,
  deleteLocation
} = require("../controllers/locationController");

const router = express.Router();

router.post("/", createLocation);
router.get("/", getLocations);
router.put("/:id", updateLocation);
router.delete("/:id", deleteLocation);

module.exports = router;
