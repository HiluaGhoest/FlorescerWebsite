const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // Get all users
  static getAllUsers(callback) {
    const query = 'SELECT id, username, email, phone, birthdate, cpf, rg, photo, isAdmin FROM users';
    db.all(query, [], (err, users) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, users);
    });
  }

  // Get user by ID
  static getUserById(id, callback) {
    const query = 'SELECT id, username, email, phone, birthdate, cpf, rg, photo, isAdmin FROM users WHERE id = ?';
    db.get(query, [id], (err, user) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, user);
    });
  }

  // Get user by email
  static getUserByEmail(email, callback) {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.get(query, [email], (err, user) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, user);
    });
  }

  // Create new user
  static createUser(userData, callback) {
    // Generate hashed password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userData.password, salt);
    
    // Generate unique ID
    const id = userData.id || 'user-' + Date.now();
    
    const query = `
      INSERT INTO users (id, username, email, phone, birthdate, cpf, rg, photo, password, isAdmin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
      id,
      userData.username,
      userData.email,
      userData.phone || '',
      userData.birthdate || '',
      userData.cpf || '',
      userData.rg || '',
      userData.photo || '',
      hashedPassword,
      userData.isAdmin ? 1 : 0
    ], function(err) {
      if (err) {
        return callback(err, null);
      }
      
      // Return the created user without password
      const newUser = {
        id,
        username: userData.username,
        email: userData.email,
        phone: userData.phone || '',
        birthdate: userData.birthdate || '',
        cpf: userData.cpf || '',
        rg: userData.rg || '',
        photo: userData.photo || '',
        isAdmin: userData.isAdmin ? 1 : 0
      };
      
      callback(null, newUser);
    });
  }

  // Update user
  static updateUser(id, userData, callback) {
    // Get current user data
    this.getUserById(id, (err, currentUser) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!currentUser) {
        return callback(new Error('User not found'), null);
      }
      
      let hashedPassword = currentUser.password;
      
      // If password is being updated, hash the new one
      if (userData.password) {
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(userData.password, salt);
      }
      
      const query = `
        UPDATE users
        SET username = ?, email = ?, phone = ?, birthdate = ?, cpf = ?, rg = ?, photo = ?, password = ?, isAdmin = ?
        WHERE id = ?
      `;
      
      db.run(query, [
        userData.username || currentUser.username,
        userData.email || currentUser.email,
        userData.phone !== undefined ? userData.phone : currentUser.phone,
        userData.birthdate !== undefined ? userData.birthdate : currentUser.birthdate,
        userData.cpf !== undefined ? userData.cpf : currentUser.cpf,
        userData.rg !== undefined ? userData.rg : currentUser.rg,
        userData.photo !== undefined ? userData.photo : currentUser.photo,
        hashedPassword,
        userData.isAdmin !== undefined ? (userData.isAdmin ? 1 : 0) : currentUser.isAdmin,
        id
      ], function(err) {
        if (err) {
          return callback(err, null);
        }
        
        // Return updated user without password
        const updatedUser = {
          id,
          username: userData.username || currentUser.username,
          email: userData.email || currentUser.email,
          phone: userData.phone !== undefined ? userData.phone : currentUser.phone,
          birthdate: userData.birthdate !== undefined ? userData.birthdate : currentUser.birthdate,
          cpf: userData.cpf !== undefined ? userData.cpf : currentUser.cpf,
          rg: userData.rg !== undefined ? userData.rg : currentUser.rg,
          photo: userData.photo !== undefined ? userData.photo : currentUser.photo,
          isAdmin: userData.isAdmin !== undefined ? (userData.isAdmin ? 1 : 0) : currentUser.isAdmin
        };
        
        callback(null, updatedUser);
      });
    });
  }

  // Delete user
  static deleteUser(id, callback) {
    const query = 'DELETE FROM users WHERE id = ?';
    db.run(query, [id], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, deleted: this.changes > 0 });
    });
  }

  // Verify password
  static verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
}

module.exports = User;