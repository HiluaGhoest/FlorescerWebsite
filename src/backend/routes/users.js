const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

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

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  User.getUserByEmail(email, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const isPasswordValid = User.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        isAdmin: user.isAdmin === 1
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    // Return user info without password and token
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin === 1
    };
    
    res.json({ 
      message: 'Login successful', 
      user: userResponse,
      token
    });
  });
});

// Register route
router.post('/register', (req, res) => {
  const { username, email, password, phone, birthdate, cpf, rg } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }
  
  // Check if user already exists
  User.getUserByEmail(email, (err, existingUser) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Create new user
    const userData = {
      username,
      email,
      password,
      phone,
      birthdate,
      cpf,
      rg,
      isAdmin: false // Regular users cannot register as admin
    };
    
    User.createUser(userData, (err, newUser) => {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
      }
      
      // Generate token
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email,
          isAdmin: newUser.isAdmin === 1
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      
      res.status(201).json({ 
        message: 'User registered successfully', 
        user: newUser,
        token
      });
    });
  });
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  User.getUserById(req.user.id, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user info without password
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      birthdate: user.birthdate,
      cpf: user.cpf,
      rg: user.rg,
      photo: user.photo,
      isAdmin: user.isAdmin === 1
    };
    
    res.json(userResponse);
  });
});

// Get all users (admin only)
router.get('/', authenticateToken, authorizeAdmin, (req, res) => {
  User.getAllUsers((err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    res.json(users);
  });
});

// Get user by ID (admin or same user)
router.get('/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;
  
  // Allow access only if admin or the same user
  if (req.user.id !== userId && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  User.getUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user info without password
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      birthdate: user.birthdate,
      cpf: user.cpf,
      rg: user.rg,
      photo: user.photo,
      isAdmin: user.isAdmin === 1
    };
    
    res.json(userResponse);
  });
});

// Update user (admin or same user)
router.put('/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;
  
  // Allow access only if admin or the same user
  if (req.user.id !== userId && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Prevent non-admins from setting admin flag
  if (!req.user.isAdmin && req.body.isAdmin !== undefined) {
    return res.status(403).json({ message: 'Cannot modify admin status' });
  }
  
  User.updateUser(userId, req.body, (err, updatedUser) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully', user: updatedUser });
  });
});

// Delete user (admin or same user)
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;
  
  // Allow access only if admin or the same user
  if (req.user.id !== userId && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  User.deleteUser(userId, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!result || !result.deleted) {
      return res.status(404).json({ message: 'User not found or could not be deleted' });
    }
    
    res.json({ message: 'User deleted successfully', id: userId });
  });
});

// Create new user (admin only)
router.post('/', authenticateToken, authorizeAdmin, (req, res) => {
  const { username, email, password, phone, birthdate, cpf, rg, isAdmin } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }
  
  // Check if user already exists
  User.getUserByEmail(email, (err, existingUser) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Create new user
    const userData = {
      username,
      email,
      password,
      phone,
      birthdate,
      cpf,
      rg,
      isAdmin
    };
    
    User.createUser(userData, (err, newUser) => {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
      }
      
      res.status(201).json({ 
        message: 'User created successfully', 
        user: newUser
      });
    });
  });
});

module.exports = router;