import React, { useEffect, useState } from "react";
import axios from "axios";
import LocationForm from "./LocationForm";
import * as XLSX from "xlsx";
import "./AdminLocationsPage.css";
import { printTableWithHeader } from "../../../utils/printUtils"; // ✅ Import your print utility

const AdminLocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const perPage = 30;

  const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

  const fetchLocations = () => {
    axios
      .get(`${API_BASE_URL}/locations`)
      .then((res) => {
        setLocations(res.data);
        setFiltered(res.data);
      })
      .catch((err) => console.error("Failed to fetch locations:", err));
  };

  useEffect(() => {
    fetchLocations();
  }, [API_BASE_URL]);

  useEffect(() => {
    const lower = search.toLowerCase();
    const results = locations.filter((loc) =>
      loc.location_name.toLowerCase().includes(lower) ||
      loc.price_in.toString().includes(lower) ||
      loc.price_out.toString().includes(lower) ||
      loc.price_in_out.toString().includes(lower)
    );
    setFiltered(results);
    setPage(1);
  }, [search, locations]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleEdit = (loc) => {
    setEditData(loc);
    setShowForm(true);
  };

  const handleDelete = (loc) => {
    if (window.confirm(`Are you sure you want to delete "${loc.location_name}"?`)) {
      axios
        .delete(`${API_BASE_URL}/locations/${loc._id}`)
        .then(() => {
          alert("Location deleted successfully.");
          fetchLocations();
        })
        .catch((err) => {
          console.error("Failed to delete location:", err);
          alert("Failed to delete location.");
        });
    }
  };

  const onFormSuccess = () => {
    fetchLocations();
    setShowForm(false);
    setEditData(null);
  };

  const onFormCancel = () => {
    setShowForm(false);
    setEditData(null);
  };

  // ✅ Updated print handler using utility
  const handlePrint = () => {
    printTableWithHeader({
      title: "Locations List",
      columns: [
        { key: "sn", label: "SN" },
        { key: "location_name", label: "Location Name" },
        { key: "price_in", label: "Price IN" },
        { key: "price_out", label: "Price OUT" },
        { key: "price_in_out", label: "Price IN & OUT" },
      ],
      rows: paginated.map((loc, index) => ({
        sn: (page - 1) * perPage + index + 1,
        ...loc,
      })),
    });
  };

  // Export handler
  const handleExportExcel = () => {
    const dataForExcel = filtered.map((loc, index) => ({
      SN: index + 1,
      "Location Name": loc.location_name,
      "Price IN": loc.price_in,
      "Price OUT": loc.price_out,
      "Price IN & OUT": loc.price_in_out,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");

    XLSX.writeFile(workbook, "locations_export.xlsx");
  };

  return (
    <div className="admin-container">
      <div className="page-header">
        <h1 className="page-title">Locations Management</h1>
      </div>

      <div className="admin-controls">
        <div className="admin-buttons-row">
          <button
            className="btn primary"
            onClick={() => {
              setEditData(null);
              setShowForm(true);
            }}
          >
            ➕ Add Location
          </button>
          <button className="btn secondary" onClick={handlePrint}>
            🖨️ Print
          </button>
          <button className="btn secondary" onClick={handleExportExcel}>
            📤 Export to Excel
          </button>
        </div>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by location name or price..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>SN</th>
            <th>Location Name</th>
            <th>Price IN</th>
            <th>Price OUT</th>
            <th>Price IN & OUT</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((loc, index) => (
            <tr key={loc._id}>
              <td>{(page - 1) * perPage + index + 1}</td>
              <td>{loc.location_name}</td>
              <td>{loc.price_in}</td>
              <td>{loc.price_out}</td>
              <td>{loc.price_in_out}</td>
              <td>
                <button
                  className="btn icon edit"
                  onClick={() => handleEdit(loc)}
                  title="Edit Location"
                >
                  ✏️
                </button>
                <button
                  className="btn icon danger"
                  onClick={() => handleDelete(loc)}
                  title="Delete Location"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="pagination-buttons">
          <button
            className="btn page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ⬅ Prev
          </button>
          <button
            className="btn page-btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ➡
          </button>
        </div>
      </div>

      {showForm && (
        <LocationForm
          initialData={editData}
          onCancel={onFormCancel}
          onSuccess={onFormSuccess}
        />
      )}
    </div>
  );
};

export default AdminLocationsPage;
