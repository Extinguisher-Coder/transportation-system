const locationModel = require("../models/locationModel");
const Student = require("../models/studentModel");
const Payment = require("../models/paymentModel");

// Create new location
const createLocation = async (req, res) => {
  try {
    const { location_name, price_in, price_out, price_in_out } = req.body;
    const location = new locationModel({ location_name, price_in, price_out, price_in_out });
    await location.save();
    res.status(201).json({ message: "Location Added", location });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all locations
const getLocations = async (req, res) => {
  try {
    const locations = await locationModel.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update location by ID and propagate updates to students/payments
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { location_name, price_in, price_out, price_in_out } = req.body;

    // Step 1: Find the existing location by ID
    const oldLocation = await locationModel.findById(id);
    if (!oldLocation) {
      return res.status(404).json({ error: "Location not found" });
    }

    const oldLocationName = oldLocation.location_name;

    // Step 2: Update the location
    const updatedLocation = await locationModel.findByIdAndUpdate(
      id,
      { location_name, price_in, price_out, price_in_out },
      { new: true, runValidators: true }
    );

    // Step 3: Update Students' location_name and weekly_fee
    await Student.updateMany(
      { location_name: oldLocationName },
      [
        {
          $set: {
            location_name: location_name,
            weekly_fee: {
              $switch: {
                branches: [
                  { case: { $eq: ["$direction", "in"] }, then: price_in },
                  { case: { $eq: ["$direction", "out"] }, then: price_out },
                  { case: { $eq: ["$direction", "in_out"] }, then: price_in_out }
                ],
                default: 0
              }
            }
          }
        }
      ]
    );

    // Step 4: Update Payments' location_name and weekly_fee
    await Payment.updateMany(
      { location_name: oldLocationName },
      [
        {
          $set: {
            location_name: location_name,
            weekly_fee: {
              $switch: {
                branches: [
                  { case: { $eq: ["$direction", "in"] }, then: price_in },
                  { case: { $eq: ["$direction", "out"] }, then: price_out },
                  { case: { $eq: ["$direction", "in_out"] }, then: price_in_out }
                ],
                default: 0
              }
            }
          }
        }
      ]
    );

    res.json({ message: "Location and related records updated", location: updatedLocation });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete location by ID
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await locationModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Location not found" });
    res.json({ message: "Location deleted", location: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createLocation,
  getLocations,
  updateLocation,
  deleteLocation
};
