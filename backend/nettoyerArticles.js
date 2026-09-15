const mysql = require('mysql2/promise');

async function nettoyer() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin123',
      database: 'gestion_boutique'
    });
    
    console.log('Articles dans la base:\n');
    const [articles] = await conn.query('SELECT id, reference, nom, quantite_stock FROM articles');
    articles.forEach(a => {
      console.log('  ID: ' + a.id + ' | Ref: ' + a.reference + ' | Nom: ' + a.nom + ' | Stock: ' + a.quantite_stock);
    });
    
    await conn.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

nettoyer();