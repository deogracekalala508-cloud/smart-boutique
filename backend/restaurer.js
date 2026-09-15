const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function restaurer() {
  try {
    console.log('🔄 Démarrage de la restauration...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin123',
      database: 'gestion_boutique',
      multipleStatements: true
    });

    // Trouver le fichier de sauvegarde le plus récent
    const backupDir = path.join(__dirname, 'sauvegardes');
    const fichiers = fs.readdirSync(backupDir).filter(f => f.endsWith('.sql'));
    
    if (fichiers.length === 0) {
      console.log('❌ Aucune sauvegarde trouvée !');
      process.exit(1);
    }
    
    const dernierFichier = fichiers.sort().reverse()[0];
    const filePath = path.join(backupDir, dernierFichier);
    
    console.log(`📂 Restauration depuis : ${dernierFichier}`);
    
    // Lire le fichier SQL
    const contenuSQL = fs.readFileSync(filePath, 'utf8');
    
    // Exécuter le SQL
    await connection.query(contenuSQL);
    
    console.log('✅ Restauration terminée avec succès !');
    await connection.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error.message);
    process.exit(1);
  }
}

restaurer();