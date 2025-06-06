const db = require('../config/db');

class Appointment {
  // Get all appointments
  static getAllAppointments(callback) {
    const query = `
      SELECT a.*, u.username, p.name as psychologist_name, t.name as therapy_name
      FROM appointments a
      JOIN users u ON a.userId = u.id
      JOIN psychologists p ON a.psychologistId = p.id
      JOIN therapies t ON a.therapyId = t.id
      ORDER BY date, time
    `;
    
    db.all(query, [], (err, appointments) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, appointments);
    });
  }

  // Get appointment by ID
  static getAppointmentById(id, callback) {
    const query = `
      SELECT a.*, u.username, p.name as psychologist_name, t.name as therapy_name
      FROM appointments a
      JOIN users u ON a.userId = u.id
      JOIN psychologists p ON a.psychologistId = p.id
      JOIN therapies t ON a.therapyId = t.id
      WHERE a.id = ?
    `;
    
    db.get(query, [id], (err, appointment) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, appointment);
    });
  }

  // Get appointments by user ID
  static getAppointmentsByUser(userId, callback) {
    const query = `
      SELECT a.*, u.username, p.name as psychologist_name, t.name as therapy_name
      FROM appointments a
      JOIN users u ON a.userId = u.id
      JOIN psychologists p ON a.psychologistId = p.id
      JOIN therapies t ON a.therapyId = t.id
      WHERE a.userId = ?
      ORDER BY date, time
    `;
    
    db.all(query, [userId], (err, appointments) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, appointments);
    });
  }

  // Get appointments by psychologist ID
  static getAppointmentsByPsychologist(psychologistId, callback) {
    const query = `
      SELECT a.*, u.username, p.name as psychologist_name, t.name as therapy_name
      FROM appointments a
      JOIN users u ON a.userId = u.id
      JOIN psychologists p ON a.psychologistId = p.id
      JOIN therapies t ON a.therapyId = t.id
      WHERE a.psychologistId = ?
      ORDER BY date, time
    `;
    
    db.all(query, [psychologistId], (err, appointments) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, appointments);
    });
  }

  // Create new appointment
  static createAppointment(appointmentData, callback) {
    // Generate unique ID if not provided
    const id = appointmentData.id || 'appt-' + Date.now();
    
    const query = `
      INSERT INTO appointments (id, userId, psychologistId, therapyId, date, time, duration, dynamic, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
      id,
      appointmentData.userId,
      appointmentData.psychologistId,
      appointmentData.therapyId,
      appointmentData.date,
      appointmentData.time,
      appointmentData.duration,
      appointmentData.dynamic || '',
      appointmentData.status || 'scheduled'
    ], function(err) {
      if (err) {
        return callback(err, null);
      }
      
      // Retrieve the full appointment details
      Appointment.getAppointmentById(id, callback);
    });
  }

  // Update appointment
  static updateAppointment(id, appointmentData, callback) {
    // Get current appointment data
    this.getAppointmentById(id, (err, currentAppointment) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!currentAppointment) {
        return callback(new Error('Appointment not found'), null);
      }
      
      const query = `
        UPDATE appointments
        SET psychologistId = ?, therapyId = ?, date = ?, time = ?, duration = ?, dynamic = ?, status = ?
        WHERE id = ?
      `;
      
      db.run(query, [
        appointmentData.psychologistId || currentAppointment.psychologistId,
        appointmentData.therapyId || currentAppointment.therapyId,
        appointmentData.date || currentAppointment.date,
        appointmentData.time || currentAppointment.time,
        appointmentData.duration || currentAppointment.duration,
        appointmentData.dynamic !== undefined ? appointmentData.dynamic : currentAppointment.dynamic,
        appointmentData.status || currentAppointment.status,
        id
      ], function(err) {
        if (err) {
          return callback(err, null);
        }
        
        // Retrieve the updated appointment details
        Appointment.getAppointmentById(id, callback);
      });
    });
  }

  // Delete appointment
  static deleteAppointment(id, callback) {
    const query = 'DELETE FROM appointments WHERE id = ?';
    db.run(query, [id], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, deleted: this.changes > 0 });
    });
  }

  // Check availability (no conflicting appointments)
  static checkAvailability(psychologistId, date, time, duration, excludeAppointmentId = null, callback) {
    // Calculate end time by adding duration minutes to the start time
    const startTime = time;
    const [hours, minutes] = startTime.split(':').map(Number);
    const endTimeMinutes = hours * 60 + minutes + Number(duration);
    const endHours = Math.floor(endTimeMinutes / 60);
    const endMinutes = endTimeMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    
    let query = `
      SELECT * FROM appointments
      WHERE psychologistId = ? AND date = ? AND status != 'cancelled'
      AND (
        (time <= ? AND ? <= time) OR
        (time <= ? AND ? <= time) OR
        (? <= time AND time <= ?)
      )
    `;
    
    let params = [psychologistId, date, startTime, endTime, startTime, endTime, startTime, endTime];
    
    if (excludeAppointmentId) {
      query += ' AND id != ?';
      params.push(excludeAppointmentId);
    }
    
    db.all(query, params, (err, conflictingAppointments) => {
      if (err) {
        return callback(err, false);
      }
      
      const isAvailable = conflictingAppointments.length === 0;
      callback(null, isAvailable);
    });
  }
}

module.exports = Appointment;