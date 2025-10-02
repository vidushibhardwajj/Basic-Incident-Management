const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const classifier = require('./classifier');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Simple email transporter - configure via env vars
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

app.post('/incident', async (req, res) => {
  try {
    const { title, description, severity, metadata } = req.body;
    if (!title || !description) return res.status(400).json({error: 'title and description required'});

    // Run classifier (category & priority)
    const result = classifier.categorizeAndPrioritize({title, description, severity, metadata});

    // Save to DB
    const incident = {
      title,
      description,
      severity: severity || result.severity || 'medium',
      category: result.category,
      priority: result.priority,
      status: 'Open',
      metadata: JSON.stringify(metadata || {}),
      created_at: new Date().toISOString()
    };
    const id = await db.createIncident(incident);

    // Send email (if configured). This will silently fail if not configured.
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: process.env.ALERT_TO || process.env.SMTP_USER,
        subject: `[${incident.priority}] Incident #${id}: ${incident.title}`,
        text: `${incident.description}\n\nCategory: ${incident.category}\nPriority: ${incident.priority}`
      };
      transporter.sendMail(mailOptions).catch(err => console.error('Mail send error:', err));
    }

    const saved = await db.getIncidentById(id);
    return res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: 'internal error', details: err.message});
  }
});

app.get('/incidents', async (req, res) => {
  const list = await db.listIncidents();
  res.json(list);
});

app.post('/incident/:id/status', async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!['Open','Acknowledged','Resolved'].includes(status)) return res.status(400).json({error:'invalid status'});
  await db.updateStatus(id, status);
  const inc = await db.getIncidentById(id);
  res.json(inc);
});

app.listen(PORT, async () => {
  console.log('Server running on port', PORT);
  // initialize DB if missing
  await db.init();
  console.log('DB initialized (incidents.db)');
});
