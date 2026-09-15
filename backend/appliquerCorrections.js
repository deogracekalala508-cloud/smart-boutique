const mysql = require('mysql2/promise');
require('dotenv').config();

async function appliquer() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'admin123',
      database: process.env.DB_NAME || 'gestion_boutique',
      multipleStatements: true
    });
    
    console.log('=== APPLICATION DES CORRECTIONS ===\n');
    
    // 1. Diagnostic doublons
    console.log('1. Verification des doublons...');
    const [doublons] = await connection.query(`
      SELECT reference, boutique_id, COUNT(*) AS nb
      FROM articles
      GROUP BY reference, boutique_id
      HAVING COUNT(*) > 1
    `);
    
    if (doublons.length > 0) {
      console.log('   ATTENTION : Doublons trouves !');
      doublons.forEach(d => {
        console.log('   Ref: ' + d.reference + ' | Boutique: ' + d.boutique_id + ' | Nombre: ' + d.nb);
      });
      console.log('\n   Corrigez manuellement ces doublons avant de continuer.');
      console.log('   Utilisez : UPDATE articles SET reference = \'nouvelle_ref\' WHERE id = X;');
      await connection.end();
      return;
    }
    console.log('   Aucun doublon\n');
    
    // 2. Voir les index sur articles
    console.log('2. Index actuels sur articles :');
    const [indexes] = await connection.query('SHOW INDEX FROM articles');
    indexes.forEach(i => {
      console.log('   - ' + i.Key_name + ' (' + i.Column_name + ') ' + (i.Non_unique === 0 ? '[UNIQUE]' : ''));
    });
    console.log('');
    
    // 3. Supprimer l'ancien index unique sur reference
    console.log('3. Suppression de l\'ancien index unique sur reference...');
    try {
      // Trouver le nom de l'index unique sur reference
      const [idx] = await connection.query(`
        SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'articles' 
        AND COLUMN_NAME = 'reference' AND NON_UNIQUE = 0
      `, [process.env.DB_NAME || 'gestion_boutique']);
      
      for (const i of idx) {
        await connection.query(`ALTER TABLE articles DROP INDEX ${i.INDEX_NAME}`);
        console.log('   Index ' + i.INDEX_NAME + ' supprime');
      }
    } catch (e) {
      console.log('   Info: ' + e.message);
    }
    
    // 4. Modifier la colonne reference
    console.log('\n4. Modification de la colonne reference...');
    try {
      await connection.query('ALTER TABLE articles MODIFY COLUMN reference VARCHAR(50) NOT NULL');
      console.log('   Colonne reference modifiee');
    } catch (e) {
      console.log('   Info: ' + e.message);
    }
    
    // 5. Ajouter l'index unique composite
    console.log('\n5. Ajout de l\'index UNIQUE (reference, boutique_id)...');
    try {
      await connection.query('ALTER TABLE articles ADD UNIQUE KEY unique_reference_boutique (reference, boutique_id)');
      console.log('   Index UNIQUE composite ajoute');
    } catch (e) {
      console.log('   Info: ' + e.message);
    }
    
    // 6. Verifier les utilisateurs avec boutique_id NULL
    console.log('\n6. Utilisateurs avec boutique_id NULL :');
    const [usersNull] = await connection.query(`
      SELECT id, nom, email, role FROM utilisateurs 
      WHERE boutique_id IS NULL AND role != 'super_admin'
    `);
    if (usersNull.length === 0) {
      console.log('   Aucun');
    } else {
      usersNull.forEach(u => {
        console.log('   ID: ' + u.id + ' | ' + u.email + ' | ' + u.role);
      });
      console.log('   Ces utilisateurs doivent etre corriges manuellement.');
    }
    
    // 7. Verifier les articles avec boutique_id NULL
    console.log('\n7. Articles avec boutique_id NULL :');
    const [articlesNull] = await connection.query(`
      SELECT id, reference, nom FROM articles WHERE boutique_id IS NULL
    `);
    if (articlesNull.length === 0) {
      console.log('   Aucun');
    } else {
      articlesNull.forEach(a => {
        console.log('   ID: ' + a.id + ' | ' + a.reference + ' | ' + a.nom);
      });
    }
    
    // 8. Verification finale
    console.log('\n8. Index finaux sur articles :');
    const [indexes2] = await connection.query('SHOW INDEX FROM articles');
    indexes2.forEach(i => {
      console.log('   - ' + i.Key_name + ' (' + i.Column_name + ') ' + (i.Non_unique === 0 ? '[UNIQUE]' : ''));
    });
    
    await connection.end();
    console.log('\n✅ Corrections terminees !');
    
  } catch (error) {
    console.error('Erreur:', error.message);
    if (connection) await connection.end();
  }
}

appliquer();