const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ─── GET /api/stats ────────────────────────────────────────────────────────────
// Returns total title count + language count per category for the Home dashboard
app.get('/api/stats', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.category,
        COUNT(t.id)              AS title_count,
        COUNT(DISTINCT t.language_id) AS language_count
      FROM titles t
      GROUP BY t.category
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/languages ────────────────────────────────────────────────────────
// ?category=movie|series  → languages with their title counts
app.get('/api/languages', async (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json({ error: 'category query param required' });
  try {
    const [rows] = await pool.query(
      `SELECT l.id, l.name,
              COUNT(t.id) AS title_count
       FROM languages l
       LEFT JOIN titles t ON t.language_id = l.id
       WHERE l.category = ?
       GROUP BY l.id, l.name
       ORDER BY l.name`,
      [category]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/languages ───────────────────────────────────────────────────────
app.post('/api/languages', async (req, res) => {
  const { category, name } = req.body;
  if (!category || !name) return res.status(400).json({ error: 'category and name are required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO languages (category, name) VALUES (?, ?)',
      [category, name.trim()]
    );
    res.status(201).json({ id: result.insertId, category, name: name.trim(), title_count: 0 });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Language already exists in this category' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/titles ──────────────────────────────────────────────────────────
// ?category=movie|series&language=Tamil
app.get('/api/titles', async (req, res) => {
  const { category, language } = req.query;
  if (!category || !language) return res.status(400).json({ error: 'category and language params required' });
  try {
    const [rows] = await pool.query(
      `SELECT t.id, t.name, t.year, t.director, t.actor, t.actress
       FROM titles t
       JOIN languages l ON l.id = t.language_id
       WHERE t.category = ? AND l.name = ?
       ORDER BY t.created_at DESC`,
      [category, language]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/titles ─────────────────────────────────────────────────────────
app.post('/api/titles', async (req, res) => {
  const { category, language, name, year, director, actor, actress } = req.body;
  if (!category || !language || !name) {
    return res.status(400).json({ error: 'category, language, and name are required' });
  }
  try {
    // Resolve language_id
    const [[lang]] = await pool.query(
      'SELECT id FROM languages WHERE category = ? AND name = ?',
      [category, language]
    );
    if (!lang) return res.status(404).json({ error: 'Language not found' });

    const [result] = await pool.query(
      `INSERT INTO titles (category, language_id, name, year, director, actor, actress)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [category, lang.id, name.trim(), year || null, director || null, actor || null, actress || null]
    );
    res.status(201).json({
      id: result.insertId, category, language, name: name.trim(),
      year: year || null, director: director || null, actor: actor || null, actress: actress || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/titles/:id ────────────────────────────────────────────────────
app.delete('/api/titles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM titles WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Title not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🎬 Aadhi backend running on http://localhost:${PORT}`));
