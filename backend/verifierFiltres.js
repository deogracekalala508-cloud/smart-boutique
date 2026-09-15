const mysql = require('mysql2/promise');

async function verifier() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin123',
      database: 'gestion_boutique'
    });
    
    console.log('=== BOUTIQUES ===');
    const [boutiques] = await conn.query('SELECT id, nom, actif FROM boutiques');
    boutiques.forEach(b => {
      console.log('  ID: ' + b.id + ' | Nom: ' + b.nom + ' | Actif: ' + b.actif);
    });
    
    console.log('\n=== ARTICLES PAR BOUTIQUE ===');
    const [articles] = await conn.query(`
      SELECT boutique_id, COUNT(*) as nb FROM articles GROUP BY boutique_id
    `);
    if (articles.length === 0) {
      console.log('  Aucun article');
    } else {
      articles.forEach(a => {
        console.log('  Boutique ' + (a.boutique_id || 'NULL') + ' : ' + a.nb + ' articles');
      });
    }
    
    console.log('\n=== VENTES PAR BOUTIQUE ===');
    const [ventes] = await conn.query(`
      SELECT boutique_id, COUNT(*) as nb FROM ventes GROUP BY boutique_id
    `);
    if (ventes.length === 0) {
      console.log('  Aucune vente');
    } else {
      ventes.forEach(v => {
        console.log('  Boutique ' + (v.boutique_id || 'NULL') + ' : ' + v.nb + ' ventes');
      });
    }
    
    console.log('\n=== CLIENTS PAR BOUTIQUE ===');
    const [clients] = await conn.query(`
      SELECT boutique_id, COUNT(*) as nb FROM clients GROUP BY boutique_id
    `);
    if (clients.length === 0) {
      console.log('  Aucun client');
    } else {
      clients.forEach(c => {
        console.log('  Boutique ' + (c.boutique_id || 'NULL') + ' : ' + c.nb + ' clients');
      });
    }
    
    await conn.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

verifier();