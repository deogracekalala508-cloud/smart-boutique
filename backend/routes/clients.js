const express = require('express');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const boutiqueId = req.user.boutique_id;

    const [clients] = await pool.query(`
      SELECT c.*,
             COUNT(v.id) as nombre_achats,
             SUM(v.montant_final) as total_achats
      FROM clients c
      LEFT JOIN ventes v ON c.id = v.client_id AND v.boutique_id = ?
      WHERE c.boutique_id = ?
      GROUP BY c.id
      ORDER BY c.nom
    `, [boutiqueId, boutiqueId]);

    res.json(clients);
  } catch (error) {
    console.error('Erreur clients:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { nom, email, telephone, adresse, date_naissance } = req.body;
    const boutiqueId = req.user.boutique_id;

    if (!nom) {
      return res.status(400).json({ message: 'Le nom est obligatoire' });
    }

    const [result] = await pool.query(
      'INSERT INTO clients (nom, email, telephone, adresse, date_naissance, boutique_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, email, telephone, adresse, date_naissance || null, boutiqueId]
    );

    res.status(201).json({ message: 'Client ajoute', id: result.insertId });
  } catch (error) {
    console.error('Erreur creation client:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const boutiqueId = req.user.boutique_id;

    const [clients] = await pool.query(
      'SELECT * FROM clients WHERE id = ? AND boutique_id = ?',
      [req.params.id, boutiqueId]
    );

    if (clients.length === 0) {
      return res.status(404).json({ message: 'Client introuvable' });
    }

    const [achats] = await pool.query(`
      SELECT v.*, u.nom as vendeur_nom
      FROM ventes v
      JOIN utilisateurs u ON v.vendeur_id = u.id
      WHERE v.client_id = ? AND v.boutique_id = ?
      ORDER BY v.created_at DESC
    `, [req.params.id, boutiqueId]);

    res.json({
      client: clients[0],
      historique: achats
    });
  } catch (error) {
    console.error('Erreur client:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Suppression reservee aux admins : un vendeur ne doit pas pouvoir supprimer un client
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const boutiqueId = req.user.boutique_id;

    const [result] = await pool.query(
      'DELETE FROM clients WHERE id = ? AND boutique_id = ?',
      [req.params.id, boutiqueId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Client introuvable' });
    }

    res.json({ message: 'Client supprime' });
  } catch (error) {
    console.error('Erreur suppression client:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;