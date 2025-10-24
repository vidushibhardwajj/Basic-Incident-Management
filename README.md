# Basic Incident System (with Automated Categorization & Prioritization)

A minimal incident-management system aimed at small teams and projects. This "basix" repository includes:

- Node.js + Express backend
- SQLite embedded database
- Simple frontend (HTML + Bootstrap)
- Rule-based **automated incident categorization & prioritization** (see `classifier.js`)
- Email alerting hooks using Nodemailer (configure with env vars)

## Quick start

1. Install Node.js (v14+ recommended).
2. In the project directory, run:
   ```bash
   npm install
   npm run init-db
   npm start
   ```
3. Open http://localhost:3000 in your browser.

## API

- `POST /incident`
  - Body: `{ title, description, severity, metadata }`
  - Response: saved incident (category & priority assigned automatically)

- `GET /incidents`
  - Returns list of incidents.

- `POST /incident/:id/status`
  - Body: `{ status }` where status is one of `Open`, `Acknowledged`, `Resolved`.

## How the automation works

The current implementation uses a **rule-based classifier** (`classifier.js`) that:
- Looks for keywords in the title & description to assign a category (Database, Network, API, etc).
- Determines priority (`P0`, `P1`, `P2`) based on severity and certain urgent keywords (like `outage`, `data loss`, `timeout`, etc).

### Upgrading to ML-based categorization & prioritization
To replace the rule-based approach with ML/NLP:
- Option A (recommended): Build a separate ML microservice (Python + Flask/FastAPI) that hosts a trained model (scikit-learn/transformers). Call it from `server.js`.
- Option B: Use a Node.js ML library or call a remote inference endpoint.

Key steps:
1. Collect labeled historical incident data (title, description, labels: category, priority).
2. Train a text classifier (TF-IDF + LogisticRegression or a transformer) to predict category and priority.
3. Expose an inference endpoint and change `classifier.js` to call it, or replace logic with a model loader.

## Environment variables (optional)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — for sending alert emails.
- `ALERT_TO` — recipient email address.
- `EMAIL_FROM` — sender email.

## Where to go next (features to add)
- ML-based classifier trained on historical incidents.
- Alert deduplication and grouping.
- Escalation policies and schedule.
- Slack / WhatsApp integrations and SMS via Twilio.
- Authentication & role-based access.

---
