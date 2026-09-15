const mysql = require('mysql2/promise');

async function creerTables() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin123',
      database: 'gestion_boutique'
    });
    
    console.log('✅ Connecté à MySQL');
    
    // Créer la table boutiques
    await conn.query(`
      CREATE TABLE IF NOT EXISTS boutiques (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nom VARCHAR(200) NOT NULL,
        proprietaire VARCHAR(200),
        telephone VARCHAR(20),
        email VARCHAR(100),
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table boutiques OK');
    
    // Ajouter boutique_id si absent
    try {
      await conn.query('ALTER TABLE utilisateurs ADD COLUMN boutique_id INT DEFAULT NULL');
      console.log('✅ boutique_id ajouté à utilisateurs');
    } catch(e) {
      console.log('ℹ️ boutique_id existe déjà dans utilisateurs');
    }
    
    try {
      await conn.query('ALTER TABLE articles ADD COLUMN boutique_id INT DEFAULT NULL');
      console.log('✅ boutique_id ajouté à articles');
    } catch(e) {
      console.log('ℹ️ boutique_id existe déjà dans articles');
    }
    
    try {
      await conn.query('ALTER TABLE ventes ADD COLUMN boutique_id INT DEFAULT NULL');
      console.log('✅ boutique_id ajouté à ventes');
    } catch(e) {
      console.log('ℹ️ boutique_id existe déjà dans ventes');
    }
    
    try {
      await conn.query('ALTER TABLE clients ADD COLUMN boutique_id INT DEFAULT NULL');
      console.log('✅ boutique_id ajouté à clients');
    } catch(e) {
      console.log('ℹ️ boutique_id existe déjà dans clients');
    }
    
    console.log('\n🎉 Toutes les tables sont prêtes !');
    await conn.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

creerTables();