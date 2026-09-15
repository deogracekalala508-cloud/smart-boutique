const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

async function chargerUtilisateur(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const [users] = await pool.query(
    `SELECT u.id, u.nom, u.email, u.role, u.actif, u.boutique_id, b.actif AS boutique_active
     FROM utilisateurs u
     LEFT JOIN boutiques b ON u.boutique_id = b.id
     WHERE u.id = ? AND u.actif = true`,
    [decoded.id]
  );

  if (users.length === 0) {
    const err = new Error('Utilisateur introuvable');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  const user = users[0];

  if (user.boutique_id && !user.boutique_active) {
    const err = new Error('Boutique desactivee');
    err.code = 'SHOP_DISABLED';
    throw err;
  }

  return user;
}

function gererErreurAuth(error, res) {
  if (error.code === 'SHOP_DISABLED') {
    return res.status(403).json({ message: 'Cette boutique est désactivée.' });
  }
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Session expiree. Reconnectez-vous.' });
  }
  return res.status(401).json({ message: 'Token invalide' });
}

async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    req.user = await chargerUtilisateur(token);
    next();
  } catch (error) {
    gererErreurAuth(error, res);
  }
}

// Variante pour les liens ouverts dans un nouvel onglet (ex: facture imprimable),
// où on ne peut pas facilement joindre un header Authorization classique.
// Accepte le token soit en header "Authorization: Bearer ...", soit en ?token=
async function authenticateFlexible(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    req.user = await chargerUtilisateur(token);
    next();
  } catch (error) {
    gererErreurAuth(error, res);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acces refuse' });
    }
    next();
  };
}

module.exports = { authenticate, authenticateFlexible, authorize };