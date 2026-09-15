const mysql = require('mysql2/promise');

async function verifier() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin123',
      database: 'gestion_boutique'
    });
    
    console.log('✅ Connecté à MySQL\n');
    
    // Lister les tables
    const [tables] = await conn.query('SHOW TABLES');
    console.log('=== TABLES EXISTANTES ===');
    tables.forEach(t => {
      console.log('  - ' + Object.values(t)[0]);
    });
    
    // Vérifier la table boutiques
    console.log('\n=== STRUCTURE DE LA TABLE BOUTIQUES ===');
    try {
      const [cols] = await conn.query('DESCRIBE boutiques');
      cols.forEach(c => {
        console.log('  - ' + c.Field + ' (' + c.Type + ')');
      });
    } catch (e) {
      console.log('❌ La table boutiques n\'existe pas !');
    }
    
    // Vérifier la table utilisateurs
    console.log('\n=== STRUCTURE DE LA TABLE UTILISATEURS ===');
    const [cols2] = await conn.query('DESCRIBE utilisateurs');
    cols2.forEach(c => {
      console.log('  - ' + c.Field + ' (' + c.Type + ')');
    });
    
    await conn.end();
    console.log('\n✅ Vérification terminée');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

verifier();