const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Appointment = require('../models/appointment');

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = 'florescer-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
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

// Get all appointments (admin only)
router.get('/', authenticateToken, authorizeAdmin, (req, res) => {
  Appointment.getAllAppointments((err, appointments) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    res.json(appointments);
  });
});

// Get appointments for current user
router.get('/my-appointments', authenticateToken, (req, res) => {
  Appointment.getAppointmentsByUser(req.user.id, (err, appointments) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    res.json(appointments);
  });
});

// Get appointments for a psychologist (admin only)
router.get('/psychologist/:psychologistId', authenticateToken, authorizeAdmin, (req, res) => {
  const psychologistId = req.params.psychologistId;
  
  Appointment.getAppointmentsByPsychologist(psychologistId, (err, appointments) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    res.json(appointments);
  });
});

// Get appointment by ID (admin or appointment owner)
router.get('/:id', authenticateToken, (req, res) => {
  const appointmentId = req.params.id;
  
  Appointment.getAppointmentById(appointmentId, (err, appointment) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if user is authorized to view this appointment
    if (appointment.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(appointment);
  });
});

// Create new appointment
router.post('/', authenticateToken, (req, res) => {
  const { psychologistId, therapyId, date, time, duration, dynamic } = req.body;
  
  if (!psychologistId || !therapyId || !date || !time || !duration) {
    return res.status(400).json({ message: 'Psychologist, therapy, date, time, and duration are required' });
  }
  
  // Check if the selected time slot is available
  Appointment.checkAvailability(psychologistId, date, time, duration, null, (err, isAvailable) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!isAvailable) {
      return res.status(400).json({ message: 'The selected time slot is not available' });
    }
    
    // Create appointment
    const appointmentData = {
      userId: req.user.id,
      psychologistId,
      therapyId,
      date,
      time,
      duration,
      dynamic,
      status: 'scheduled'
    };
    
    Appointment.createAppointment(appointmentData, (err, newAppointment) => {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
      }
      
      res.status(201).json({ 
        message: 'Appointment created successfully', 
        appointment: newAppointment
      });
    });
  });
});

// Update appointment (admin or appointment owner)
router.put('/:id', authenticateToken, (req, res) => {
  const appointmentId = req.params.id;
  
  // Check if appointment exists and user is authorized
  Appointment.getAppointmentById(appointmentId, (err, appointment) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if user is authorized to update this appointment
    if (appointment.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // If changing date/time/duration/psychologist, check availability
    if ((req.body.psychologistId && req.body.psychologistId !== appointment.psychologistId) ||
        (req.body.date && req.body.date !== appointment.date) || 
        (req.body.time && req.body.time !== appointment.time) ||
        (req.body.duration && req.body.duration !== appointment.duration)) {
      
      Appointment.checkAvailability(
        req.body.psychologistId || appointment.psychologistId,
        req.body.date || appointment.date,
        req.body.time || appointment.time,
        req.body.duration || appointment.duration,
        appointmentId,
        (err, isAvailable) => {
          if (err) {
            return res.status(500).json({ message: 'Server error', error: err.message });
          }
          
          if (!isAvailable) {
            return res.status(400).json({ message: 'The selected time slot is not available' });
          }
          
          // Update appointment
          Appointment.updateAppointment(appointmentId, req.body, (err, updatedAppointment) => {
            if (err) {
              return res.status(500).json({ message: 'Server error', error: err.message });
            }
            
            res.json({ message: 'Appointment updated successfully', appointment: updatedAppointment });
          });
        }
      );
    } else {
      // No need to check availability if not changing time-related fields
      Appointment.updateAppointment(appointmentId, req.body, (err, updatedAppointment) => {
        if (err) {
          return res.status(500).json({ message: 'Server error', error: err.message });
        }
        
        res.json({ message: 'Appointment updated successfully', appointment: updatedAppointment });
      });
    }
  });
});

// Cancel appointment (admin or appointment owner)
router.put('/:id/cancel', authenticateToken, (req, res) => {
  const appointmentId = req.params.id;
  
  // Check if appointment exists and user is authorized
  Appointment.getAppointmentById(appointmentId, (err, appointment) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if user is authorized to cancel this appointment
    if (appointment.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update appointment status
    Appointment.updateAppointment(appointmentId, { status: 'cancelled' }, (err, updatedAppointment) => {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
      }
      
      res.json({ message: 'Appointment cancelled successfully', appointment: updatedAppointment });
    });
  });
});

// Delete appointment (admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const appointmentId = req.params.id;
  
  Appointment.deleteAppointment(appointmentId, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!result || !result.deleted) {
      return res.status(404).json({ message: 'Appointment not found or could not be deleted' });
    }
    
    res.json({ message: 'Appointment deleted successfully', id: appointmentId });
  });
});

module.exports = router;