const express = require('express');
const router = express.Router();
const termController = require('../controllers/termController');

// Get the current term based on today's date
router.get('/current', termController.getCurrentTerm);

// Get numberOfWeeks for a specific term
router.get('/weeks/:termName', termController.getTermWeeks);

// Create a new term
router.post('/', termController.createTerm);

// Get all terms
router.get('/', termController.getAllTerms);

// Update a term by termName
router.put('/:termName', termController.updateTerm);

// Delete a term by _id
router.delete('/:termId', termController.deleteTerm);

module.exports = router;
