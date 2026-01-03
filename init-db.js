const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    
    console.log('Database initialized successfully!');
    console.log('Tables created: lost_ids, found_ids, requests, suspended_students');
    
    // Optionally seed some suspended students
    const seedSuspended = await pool.query(
      `SELECT COUNT(*) FROM suspended_students`
    );
    
    if (parseInt(seedSuspended.rows[0].count) === 0) {
      console.log('Seeding suspended students...');
      await pool.query(`
        INSERT INTO suspended_students (name, student_id, email, phone, status) VALUES
        ('Daniel Kebede', 'UGR/1234/01', 'daniel.kebede@university.edu', '+251912345678', 'Suspended'),
        ('Sara Mekonnen', 'UGR/5678/02', 'sara.mekonnen@university.edu', '+251987654321', 'Suspended'),
        ('Abebe Tadesse', 'UGR/9012/03', 'abebe.tadesse@university.edu', '+251911223344', 'Suspended'),
        ('Mahiye Alemu', 'UGR/3456/04', 'mahiye.alemu@university.edu', '+251933445566', 'Suspended')
      `);
      console.log('Suspended students seeded!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();

