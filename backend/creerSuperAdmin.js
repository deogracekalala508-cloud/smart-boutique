const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function creerSuperAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin123',
      database: 'gestion_boutique'
    });

    console.log('✅ Connecté à MySQL');

    const email = 'superadmin@smartboutique.com';
    const motDePasse = 'SuperAdmin2026!';
    
    // Vérifier si le super admin existe
    const [existing] = await connection.query(
      'SELECT id FROM utilisateurs WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      // Mettre à jour le rôle
      await connection.query(
        'UPDATE utilisateurs SET role = \'super_admin\', actif = true WHERE email = ?',
        [email]
      );
      console.log('✅ Super admin mis à jour');
    } else {
      // Créer le super admin
      const motDePasseHash = await bcrypt.hash(motDePasse, 14);
      
      await connection.query(
        'INSERT INTO utilisateurs (nom, email, mot_de_passe, role, actif, boutique_id) VALUES (?, ?, ?, \'super_admin\', true, NULL)',
        ['Super Admin', email, motDePasseHash]
      );
      console.log('✅ Super admin créé');
    }
    
    console.log('\n========================================');
    console.log('🔑 COMPTE SUPER ADMIN');
    console.log('========================================');
    console.log('Email : ' + email);
    console.log('Mot de passe : ' + motDePasse);
    console.log('========================================\n');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

creerSuperAdmin();