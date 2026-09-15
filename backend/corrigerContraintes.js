const mysql = require('mysql2/promise');

async function corriger() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin123',
      database: 'gestion_boutique'
    });
    
    console.log('=== CORRECTION DES CONTRAINTES ===\n');
    
    // 1. Supprimer l'index unique sur reference
    console.log('1. Suppression de l\'index unique sur reference...');
    try {
      await conn.query('ALTER TABLE articles DROP INDEX reference');
      console.log('   Index supprime');
    } catch(e) {
      console.log('   Index reference deja supprime ou introuvable');
    }
    
    // 2. Verifier si l'index unique existe encore
    console.log('\n2. Verification des index sur articles...');
    const [indexes] = await conn.query('SHOW INDEX FROM articles');
    indexes.forEach(i => {
      console.log('   Index : ' + i.Key_name + ' | Colonne : ' + i.Column_name + ' | Unique : ' + (i.Non_unique === 0 ? 'OUI' : 'NON'));
    });
    
    // 3. Modifier la colonne reference pour retirer UNIQUE
    console.log('\n3. Modification de la colonne reference...');
    try {
      await conn.query('ALTER TABLE articles MODIFY COLUMN reference VARCHAR(50) NOT NULL');
      console.log('   Colonne reference modifiee (sans UNIQUE)');
    } catch(e) {
      console.log('   Erreur : ' + e.message);
    }
    
    // 4. Ajouter un index unique sur (reference + boutique_id)
    console.log('\n4. Ajout d\'un index unique sur (reference, boutique_id)...');
    try {
      await conn.query('ALTER TABLE articles ADD UNIQUE KEY unique_ref_boutique (reference, boutique_id)');
      console.log('   Index unique (reference, boutique_id) ajoute');
    } catch(e) {
      console.log('   Index deja existant ou erreur : ' + e.message);
    }
    
    // 5. Verification finale
    console.log('\n5. Verification finale des index...');
    const [indexes2] = await conn.query('SHOW INDEX FROM articles');
    indexes2.forEach(i => {
      console.log('   Index : ' + i.Key_name + ' | Colonne : ' + i.Column_name + ' | Unique : ' + (i.Non_unique === 0 ? 'OUI' : 'NON'));
    });
    
    // 6. Voir les articles actuels
    console.log('\n=== ARTICLES ACTUELS ===');
    const [articles] = await conn.query('SELECT id, reference, nom, boutique_id FROM articles');
    if (articles.length === 0) {
      console.log('   Aucun article');
    } else {
      articles.forEach(a => {
        console.log('   ID: ' + a.id + ' | Ref: ' + a.reference + ' | Nom: ' + a.nom + ' | Boutique: ' + (a.boutique_id || 'NULL'));
      });
    }
    
    // 7. Verifier les utilisateurs
    console.log('\n=== UTILISATEURS ACTUELS ===');
    const [users] = await conn.query('SELECT id, email, role, boutique_id FROM utilisateurs');
    users.forEach(u => {
      console.log('   ID: ' + u.id + ' | ' + u.email + ' | ' + u.role + ' | Boutique: ' + (u.boutique_id || 'NULL'));
    });
    
    await conn.end();
    console.log('\n🎉 Correction terminee !');
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

corriger();
