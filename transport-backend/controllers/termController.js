const Term = require('../models/termModel');

// Create a new term
exports.createTerm = async (req, res) => {
  try {
    const term = await Term.create(req.body);
    res.status(201).json(term);
  } catch (error) {
    console.error("Create term failed:", error);
    res.status(400).json({ message: 'Failed to create term', error: error.message });
  }
};

// Get all terms
exports.getAllTerms = async (req, res) => {
  try {
    const terms = await Term.find().sort({ createdAt: -1 });
    res.json(terms);
  } catch (error) {
    console.error("Fetch all terms failed:", error);
    res.status(500).json({ message: 'Failed to fetch terms' });
  }
};

// Update a term by termName
exports.updateTerm = async (req, res) => {
  try {
    const updated = await Term.findOneAndUpdate(
      { termName: req.params.termName },
      req.body,
      {
        new: true,
        runValidators: true,
        context: 'query',
      }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Term not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error("Update term failed:", error);
    res.status(400).json({ message: 'Failed to update term', error: error.message });
  }
};

// Delete a term by _id
exports.deleteTerm = async (req, res) => {
  try {
    const deleted = await Term.findByIdAndDelete(req.params.termId);
    if (!deleted) {
      return res.status(404).json({ message: 'Term not found' });
    }
    res.json({ message: 'Term deleted successfully' });
  } catch (error) {
    console.error("Delete term failed:", error);
    res.status(500).json({ message: 'Failed to delete term' });
  }
};

// Get numberOfWeeks for a specific term
exports.getTermWeeks = async (req, res) => {
  try {
    const term = await Term.findOne({ termName: req.params.termName });
    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }
    res.json({ termName: term.termName, numberOfWeeks: term.numberOfWeeks });
  } catch (error) {
    console.error("Get term weeks failed:", error);
    res.status(500).json({ message: 'Failed to fetch term weeks' });
  }
};

// Get the current term based on today’s date
exports.getCurrentTerm = async (req, res) => {
  try {
    const today = new Date();
    const currentTerm = await Term.findOne({
      startDate: { $lte: today },
      endDate: { $gte: today },
    });

    if (!currentTerm) {
      return res.status(404).json({ message: 'No active term found' });
    }

    res.json(currentTerm);
  } catch (error) {
    console.error("Get current term failed:", error);
    res.status(500).json({ message: 'Failed to fetch current term', error: error.message });
  }
};
