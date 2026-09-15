const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function creerVendeur() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin123',
      database: 'gestion_boutique'
    });

    console.log('✅ Connecté à MySQL');

    const motDePasseHash = await bcrypt.hash('vendeur123', 10);
    
    await connection.query(
      "INSERT INTO utilisateurs (nom, email, mot_de_passe, role, actif) VALUES (?, ?, ?, 'vendeur', true)",
      ['Vendeur Test', 'vendeur@boutique.com', motDePasseHash]
    );
    
    console.log('✅ Vendeur créé !');
    console.log('   Email: vendeur@boutique.com');
    console.log('   Mot de passe: vendeur123');

    await connection.end();
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ Le vendeur existe déjà !');
    } else {
      console.error('❌ Erreur:', error.message);
    }
    process.exit(1);
  }
}

creerVendeur();