import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db.js';
import { inquirySchema, loginSchema, statusSchema } from './validation.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

const tokenFor = (user) => jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required.' });
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'dev-secret');
    next();
  } catch { res.status(401).json({ error: 'Your session is invalid or expired.' }); }
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Enter a valid email and password.' });
    const result = await query('SELECT id, name, email, password_hash FROM staff WHERE email = $1', [parsed.data.email.toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password_hash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
    res.json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});

app.get('/api/inquiries', requireAuth, async (req, res, next) => {
  try {
    const status = req.query.status;
    const values = [req.user.id];
    let filter = 'WHERE owner_id = $1';
    if (['new', 'in_progress', 'resolved'].includes(status)) { values.push(status); filter += ' AND status = $2'; }
    const result = await query(`SELECT id, customer_name AS "customerName", contact, subject, description, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM inquiries ${filter} ORDER BY updated_at DESC`, values);
    res.json({ inquiries: result.rows });
  } catch (error) { next(error); }
});

app.post('/api/inquiries', requireAuth, async (req, res, next) => {
  try {
    const parsed = inquirySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Check the form fields and try again.', fields: parsed.error.flatten().fieldErrors });
    const { customerName, contact, subject, description } = parsed.data;
    const result = await query('INSERT INTO inquiries (owner_id, customer_name, contact, subject, description) VALUES ($1, $2, $3, $4, $5) RETURNING id, customer_name AS "customerName", contact, subject, description, status, created_at AS "createdAt", updated_at AS "updatedAt"', [req.user.id, customerName, contact, subject, description]);
    res.status(201).json({ inquiry: result.rows[0] });
  } catch (error) { next(error); }
});

app.get('/api/inquiries/:id', requireAuth, async (req, res, next) => {
  try {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: 'Inquiry id must be a number.' });
    const result = await query('SELECT id, customer_name AS "customerName", contact, subject, description, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM inquiries WHERE id = $1 AND owner_id = $2', [req.params.id, req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Inquiry not found.' });
    res.json({ inquiry: result.rows[0] });
  } catch (error) { next(error); }
});

app.patch('/api/inquiries/:id/status', requireAuth, async (req, res, next) => {
  try {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: 'Inquiry id must be a number.' });
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Choose a valid status.' });
    const result = await query('UPDATE inquiries SET status = $1, updated_at = NOW() WHERE id = $2 AND owner_id = $3 RETURNING id, customer_name AS "customerName", contact, subject, description, status, created_at AS "createdAt", updated_at AS "updatedAt"', [parsed.data.status, req.params.id, req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Inquiry not found or not accessible.' });
    res.json({ inquiry: result.rows[0] });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ error: 'Something went wrong on the server.' }); });
export { app, requireAuth };