const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 files
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ==================== FOUND IDs ENDPOINTS ====================

// GET all found IDs
app.get('/foundIDs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, found_id as "foundID", phone, email, created_at FROM found_ids ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching found IDs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new found ID
app.post('/foundIDs', async (req, res) => {
  try {
    const { name, foundID, phone, email } = req.body;

    if (!name || !foundID || !phone || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO found_ids (name, found_id, phone, email) VALUES ($1, $2, $3, $4) RETURNING id, name, found_id as "foundID", phone, email',
      [name, foundID, phone, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating found ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== LOST IDs ENDPOINTS ====================

// GET all lost IDs
app.get('/lostIDs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, student_id as "studentID", phone, email, created_at FROM lost_ids ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lost IDs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new lost ID
app.post('/lostIDs', async (req, res) => {
  try {
    const { name, studentID, phone, email } = req.body;

    if (!name || !studentID || !phone || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO lost_ids (name, student_id, phone, email) VALUES ($1, $2, $3, $4) RETURNING id, name, student_id as "studentID", phone, email',
      [name, studentID, phone, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating lost ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SUSPENDED STUDENTS ENDPOINTS ====================

// GET all suspended students
app.get('/suspendedStudents', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, student_id as "studentID", email, phone, status FROM suspended_students ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching suspended students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new suspended student (for admin use)
app.post('/suspendedStudents', async (req, res) => {
  try {
    const { name, studentID, email, phone, status } = req.body;

    if (!name || !studentID || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO suspended_students (name, student_id, email, phone, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, student_id as "studentID", email, phone, status',
      [name, studentID, email, phone, status || 'Suspended']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating suspended student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== REQUESTS ENDPOINTS ====================

// GET all requests
app.get('/requests', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, lost_id as "lostID", email, date, status, police_report as "policeReport" FROM requests ORDER BY date DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET request by ID
app.get('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, lost_id as "lostID", email, date, status, police_report as "policeReport" FROM requests WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new request
app.post('/requests', async (req, res) => {
  try {
    const { name, lostID, email, date, status, policeReport } = req.body;

    if (!name || !lostID || !email || !policeReport) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO requests (name, lost_id, email, date, status, police_report) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, lost_id as "lostID", email, date, status, police_report as "policeReport"',
      [name, lostID, email, date || new Date(), status || 'pending', policeReport]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH request status (approve/update)
app.patch('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await pool.query(
      'UPDATE requests SET status = $1 WHERE id = $2 RETURNING id, name, lost_id as "lostID", email, date, status, police_report as "policeReport"',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE request (optional)
app.delete('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM requests WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

