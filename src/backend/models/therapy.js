const db = require('../config/db');

class Therapy {
  // Get all therapies
  static getAllTherapies(callback) {
    const query = 'SELECT * FROM therapies';
    db.all(query, [], (err, therapies) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, therapies);
    });
  }

  // Get therapy by ID
  static getTherapyById(id, callback) {
    const query = 'SELECT * FROM therapies WHERE id = ?';
    db.get(query, [id], (err, therapy) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, therapy);
    });
  }

  // Create new therapy
  static createTherapy(therapyData, callback) {
    // Generate unique ID if not provided
    const id = therapyData.id || therapyData.name.toLowerCase().replace(/ /g, '-');
    
    const query = `
      INSERT INTO therapies (id, name, description, duration_options)
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(query, [
      id,
      therapyData.name,
      therapyData.description || '',
      therapyData.duration_options || '45,50'
    ], function(err) {
      if (err) {
        return callback(err, null);
      }
      
      const newTherapy = {
        id,
        name: therapyData.name,
        description: therapyData.description || '',
        duration_options: therapyData.duration_options || '45,50'
      };
      
      callback(null, newTherapy);
    });
  }

  // Update therapy
  static updateTherapy(id, therapyData, callback) {
    // Get current therapy data
    this.getTherapyById(id, (err, currentTherapy) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!currentTherapy) {
        return callback(new Error('Therapy not found'), null);
      }
      
      const query = `
        UPDATE therapies
        SET name = ?, description = ?, duration_options = ?
        WHERE id = ?
      `;
      
      db.run(query, [
        therapyData.name || currentTherapy.name,
        therapyData.description !== undefined ? therapyData.description : currentTherapy.description,
        therapyData.duration_options !== undefined ? therapyData.duration_options : currentTherapy.duration_options,
        id
      ], function(err) {
        if (err) {
          return callback(err, null);
        }
        
        const updatedTherapy = {
          id,
          name: therapyData.name || currentTherapy.name,
          description: therapyData.description !== undefined ? therapyData.description : currentTherapy.description,
          duration_options: therapyData.duration_options !== undefined ? therapyData.duration_options : currentTherapy.duration_options
        };
        
        callback(null, updatedTherapy);
      });
    });
  }

  // Delete therapy
  static deleteTherapy(id, callback) {
    const query = 'DELETE FROM therapies WHERE id = ?';
    db.run(query, [id], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, deleted: this.changes > 0 });
    });
  }
}

module.exports = Therapy;