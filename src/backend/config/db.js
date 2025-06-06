const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const dbPath = path.join(dataDir, 'florescer.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables if they don't exist
function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    birthdate TEXT,
    cpf TEXT UNIQUE,
    rg TEXT,
    photo TEXT,
    password TEXT NOT NULL,
    isAdmin INTEGER DEFAULT 0
  )`);

  // Therapies table
  db.run(`CREATE TABLE IF NOT EXISTS therapies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration_options TEXT
  )`);

  // Psychologists table
  db.run(`CREATE TABLE IF NOT EXISTS psychologists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    specialization TEXT,
    photo TEXT
  )`);

  // Appointments table
  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    psychologistId TEXT NOT NULL,
    therapyId TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER NOT NULL,
    dynamic TEXT,
    status TEXT DEFAULT 'scheduled',
    FOREIGN KEY (userId) REFERENCES users (id),
    FOREIGN KEY (psychologistId) REFERENCES psychologists (id),
    FOREIGN KEY (therapyId) REFERENCES therapies (id)
  )`);

  // Add default therapies
  const defaultTherapies = [
    { id: 'terapia-grupo', name: 'Terapia em Grupo', description: 'Sessões terapêuticas em grupo', duration_options: '45,50' },
    { id: 'terapia-casal', name: 'Terapia de Casal', description: 'Sessões para casais', duration_options: '45,50' },
    { id: 'terapia-individual', name: 'Terapia Individual', description: 'Sessões individuais', duration_options: '45,50' },
    { id: 'orientacao-pais', name: 'Orientação de Pais', description: 'Sessões para orientação parental', duration_options: '45,50' },
    { id: 'terapia-psicomotora', name: 'Terapia Psicomotora', description: 'Sessões focadas em habilidades motoras', duration_options: '45,50' },
    { id: 'terapia-ludica', name: 'Terapia Lúdica', description: 'Sessões terapêuticas por meio de jogos', duration_options: '45,50' },
    { id: 'psicanalise', name: 'Psicanálise', description: 'Sessões de psicanálise', duration_options: '45,50' },
    { id: 'arteterapia', name: 'Arteterapia', description: 'Terapia por meio da arte', duration_options: '50,90' }
  ];

  const insertTherapy = db.prepare('INSERT OR IGNORE INTO therapies (id, name, description, duration_options) VALUES (?, ?, ?, ?)');
  defaultTherapies.forEach(therapy => {
    insertTherapy.run(therapy.id, therapy.name, therapy.description, therapy.duration_options);
  });
  insertTherapy.finalize();

  // Add default admin user if none exists
  db.get('SELECT * FROM users WHERE isAdmin = 1', (err, row) => {
    if (!row) {
      const bcrypt = require('bcryptjs');
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('admin123', salt);
      
      db.run(
        'INSERT INTO users (id, username, email, password, isAdmin) VALUES (?, ?, ?, ?, ?)',
        ['admin-' + Date.now(), 'Admin', 'admin@florescer.com', hashedPassword, 1]
      );
    }
  });

  // Add default psychologists
  const defaultPsychologists = [
    { id: '1', name: 'Dra. Maria Silva', email: 'maria@florescer.com', specialization: 'Arte Terapia', photo: 'psychologist1.jpg' },
    { id: '2', name: 'Dr. João Santos', email: 'joao@florescer.com', specialization: 'Terapia Individual', photo: 'psychologist2.jpg' },
    { id: '3', name: 'Dra. Ana Oliveira', email: 'ana@florescer.com', specialization: 'Psicanálise', photo: 'psychologist3.jpg' }
  ];

  const insertPsychologist = db.prepare('INSERT OR IGNORE INTO psychologists (id, name, email, specialization, photo) VALUES (?, ?, ?, ?, ?)');
  defaultPsychologists.forEach(psych => {
    insertPsychologist.run(psych.id, psych.name, psych.email, psych.specialization, psych.photo);
  });
  insertPsychologist.finalize();
}

module.exports = db;