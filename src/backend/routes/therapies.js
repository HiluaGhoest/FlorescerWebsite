const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Therapy = require('../models/therapy');

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = 'florescer-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  // Skip authentication for GET requests to allow public access to therapy list
  if (req.method === 'GET') {
    return next();
  }
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

// Admin authorization middleware
const authorizeAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  
  next();
};

// Get all therapies (public)
router.get('/', (req, res) => {
  Therapy.getAllTherapies((err, therapies) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    res.json(therapies);
  });
});

// Get therapy by ID (public)
router.get('/:id', (req, res) => {
  const therapyId = req.params.id;
  
  Therapy.getTherapyById(therapyId, (err, therapy) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!therapy) {
      return res.status(404).json({ message: 'Therapy not found' });
    }
    
    res.json(therapy);
  });
});

// Create new therapy (admin only)
router.post('/', authenticateToken, authorizeAdmin, (req, res) => {
  const { name, description, duration_options } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Therapy name is required' });
  }
  
  // Create new therapy
  const therapyData = {
    name,
    description,
    duration_options
  };
  
  Therapy.createTherapy(therapyData, (err, newTherapy) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    res.status(201).json({ 
      message: 'Therapy created successfully', 
      therapy: newTherapy
    });
  });
});

// Update therapy (admin only)
router.put('/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const therapyId = req.params.id;
  const { name, description, duration_options } = req.body;
  
  Therapy.updateTherapy(therapyId, req.body, (err, updatedTherapy) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!updatedTherapy) {
      return res.status(404).json({ message: 'Therapy not found' });
    }
    
    res.json({ message: 'Therapy updated successfully', therapy: updatedTherapy });
  });
});

// Delete therapy (admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const therapyId = req.params.id;
  
  Therapy.deleteTherapy(therapyId, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!result || !result.deleted) {
      return res.status(404).json({ message: 'Therapy not found or could not be deleted' });
    }
    
    res.json({ message: 'Therapy deleted successfully', id: therapyId });
  });
});

module.exports = router;