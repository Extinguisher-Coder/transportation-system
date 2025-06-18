import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LocationForm.css";

const LocationForm = ({ initialData = null, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    location_name: "",
    price_in: "",
    price_out: "",
    price_in_out: "",
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.location_name) {
      return alert("Location name is required.");
    }

    try {
      if (initialData) {
        // Update existing location
        await axios.put(`${API_BASE_URL}/locations/${initialData._id}`, formData);
        alert("Location updated successfully.");
      } else {
        // Create new location
        await axios.post(`${API_BASE_URL}/locations`, formData);
        alert("Location created successfully.");
      }

      if (onSuccess) onSuccess(); // Notify parent to refresh data
      if (onCancel) onCancel();   // Close the form/modal
    } catch (error) {
      console.error("Failed to submit location:", error);
      alert("Failed to submit location.");
    }
  };

  return (
    <div className="location-form-overlay">
      <div className="location-form-wrapper">
        {onCancel && (
          <button className="close-button" onClick={onCancel}>
            &times;
          </button>
        )}

        <form className="location-form" onSubmit={handleSubmit}>
          <h2>{initialData ? "Edit Location" : "Add New Location"}</h2>

          <label>
            Location Name:
            <input
              type="text"
              name="location_name"
              value={formData.location_name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Price IN:
            <input
              type="number"
              name="price_in"
              value={formData.price_in}
              onChange={handleChange}
            />
          </label>

          <label>
            Price OUT:
            <input
              type="number"
              name="price_out"
              value={formData.price_out}
              onChange={handleChange}
            />
          </label>

          <label>
            Price IN & OUT:
            <input
              type="number"
              name="price_in_out"
              value={formData.price_in_out}
              onChange={handleChange}
            />
          </label>

          <div className="form-buttons">
            <button type="submit" className="btn primary">
              {initialData ? "Update" : "Create"}
            </button>
            <button type="button" className="btn danger" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationForm;
