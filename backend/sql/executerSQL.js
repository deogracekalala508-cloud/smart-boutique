const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function executerSQL() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'admin123',
      database: process.env.DB_NAME || 'gestion_boutique',
      multipleStatements: true
    });
    
    console.log('Connecte a MySQL\n');
    
    const sqlDir = path.join(__dirname, 'sql');
    
    if (!fs.existsSync(sqlDir)) {
      console.error('Dossier sql introuvable : ' + sqlDir);
      console.error('Creez le dossier backend/sql et placez-y les fichiers .sql');
      await connection.end();
      return;
    }
    
    const fichiers = fs.readdirSync(sqlDir).filter(f => f.endsWith('.sql')).sort();
    
    if (fichiers.length === 0) {
      console.error('Aucun fichier .sql trouve dans backend/sql');
      await connection.end();
      return;
    }
    
    console.log('Fichiers SQL trouves :');
    fichiers.forEach(f => console.log('  - ' + f));
    console.log('');
    
    for (const fichier of fichiers) {
      console.log('========================================');
      console.log('Execution de : ' + fichier);
      console.log('========================================');
      
      const contenu = fs.readFileSync(path.join(sqlDir, fichier), 'utf8');
      
      try {
        const [results] = await connection.query(contenu);
        console.log('Fichier ' + fichier + ' execute avec succes');
        
        if (Array.isArray(results)) {
          results.forEach((r, i) => {
            if (Array.isArray(r) && r.length > 0) {
              console.log('  Resultat ' + (i + 1) + ' : ' + r.length + ' ligne(s)');
            }
          });
        }
      } catch (err) {
        console.error('ERREUR dans ' + fichier + ' : ' + err.message);
        console.error('Arret de l\'execution');
        await connection.end();
        return;
      }
      
      console.log('');
    }
    
    await connection.end();
    console.log('Toutes les corrections ont ete appliquees !');
    
  } catch (error) {
    console.error('Erreur:', error.message);
    if (connection) await connection.end();
  }
}

executerSQL();