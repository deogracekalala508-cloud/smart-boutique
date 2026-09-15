const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function faireSauvegarde() {
  try {
    console.log('🔄 Démarrage de la sauvegarde...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin123',
      database: 'gestion_boutique'
    });

    // Créer le dossier de sauvegarde
    const backupDir = path.join(__dirname, 'sauvegardes');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Nom du fichier avec la date
    const date = new Date();
    const nomFichier = `sauvegarde_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}.sql`;
    
    const filePath = path.join(backupDir, nomFichier);

    // Récupérer toutes les tables
    const [tables] = await connection.query('SHOW TABLES');
    
    let contenuSQL = '-- Sauvegarde EMBM Business\n';
    contenuSQL += `-- Date : ${date.toLocaleString('fr-FR')}\n\n`;
    contenuSQL += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

    // Pour chaque table
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`📦 Sauvegarde de la table : ${tableName}`);
      
      // Récupérer la structure
      const [structure] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
      contenuSQL += structure[0]['Create Table'] + ';\n\n';
      
      // Récupérer les données
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        contenuSQL += `INSERT INTO \`${tableName}\` VALUES\n`;
        
        const lignes = rows.map(row => {
          const valeurs = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'number') return val;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          return `(${valeurs.join(', ')})`;
        });
        
        contenuSQL += lignes.join(',\n') + ';\n\n';
      }
    }

    contenuSQL += 'SET FOREIGN_KEY_CHECKS = 1;\n';

    // Écrire le fichier
    fs.writeFileSync(filePath, contenuSQL);
    
    console.log(`✅ Sauvegarde terminée : ${nomFichier}`);
    console.log(`📍 Emplacement : ${filePath}`);
    
    // Supprimer les anciennes sauvegardes (garder les 7 dernières)
    const fichiers = fs.readdirSync(backupDir).filter(f => f.endsWith('.sql'));
    if (fichiers.length > 7) {
      fichiers.sort().reverse().slice(7).forEach(f => {
        fs.unlinkSync(path.join(backupDir, f));
        console.log(`🗑️ Ancienne sauvegarde supprimée : ${f}`);
      });
    }

    await connection.end();
    console.log('🎉 Sauvegarde terminée avec succès !');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error.message);
    process.exit(1);
  }
}

faireSauvegarde();