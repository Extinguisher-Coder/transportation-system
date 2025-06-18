const locationModel = require("../models/locationModel");

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

// Update location by ID
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await locationModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: "Location not found" });
    res.json({ message: "Location updated", location: updated });
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
