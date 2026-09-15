const mysql = require('mysql2/promise');

async function corriger() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin123',
      database: 'gestion_boutique'
    });
    
    console.log('=== VERIFICATION DES UTILISATEURS ===\n');
    
    const [users] = await conn.query('SELECT id, nom, email, role, boutique_id FROM utilisateurs');
    users.forEach(u => {
      console.log('ID: ' + u.id + ' | ' + u.nom + ' | ' + u.email + ' | ' + u.role + ' | Boutique: ' + (u.boutique_id || 'NULL'));
    });
    
    console.log('\n=== BOUTIQUES DISPONIBLES ===\n');
    const [boutiques] = await conn.query('SELECT id, nom FROM boutiques');
    boutiques.forEach(b => {
      console.log('ID: ' + b.id + ' | ' + b.nom);
    });
    
    console.log('\n⚠️  Si un utilisateur a boutique_id = NULL, il faut le corriger manuellement.');
    console.log('Utilisez cette commande en remplacant les valeurs :');
    console.log('  UPDATE utilisateurs SET boutique_id = X WHERE email = \'email@exemple.com\';');
    
    await conn.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

corriger();