const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    // Connexion à MySQL sans base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin123'
    });

    console.log('✅ Connecté à MySQL');

    // Créer la base de données
    await connection.query('CREATE DATABASE IF NOT EXISTS gestion_boutique');
    await connection.query('USE gestion_boutique');
    console.log('✅ Base de données créée');

    // Créer les tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nom VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mot_de_passe VARCHAR(255) NOT NULL,
        role ENUM('admin', 'gestionnaire', 'vendeur') DEFAULT 'vendeur',
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        reference VARCHAR(50) UNIQUE NOT NULL,
        nom VARCHAR(200) NOT NULL,
        description TEXT,
        prix_achat DECIMAL(10,2) NOT NULL,
        prix_vente DECIMAL(10,2) NOT NULL,
        quantite_stock INT DEFAULT 0,
        seuil_alerte INT DEFAULT 5,
        taille VARCHAR(20),
        couleur VARCHAR(50),
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nom VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        telephone VARCHAR(20),
        points_fidelite INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ventes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        numero_facture VARCHAR(50) UNIQUE NOT NULL,
        client_id INT,
        vendeur_id INT NOT NULL,
        montant_total DECIMAL(10,2) NOT NULL,
        remise DECIMAL(10,2) DEFAULT 0,
        montant_final DECIMAL(10,2) NOT NULL,
        mode_paiement VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (vendeur_id) REFERENCES utilisateurs(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ventes_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        vente_id INT NOT NULL,
        article_id INT NOT NULL,
        quantite INT NOT NULL,
        prix_unitaire DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (vente_id) REFERENCES ventes(id),
        FOREIGN KEY (article_id) REFERENCES articles(id)
      )
    `);

    console.log('✅ Tables créées');

    // Créer l'utilisateur admin
    const motDePasseHash = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT INTO utilisateurs (nom, email, mot_de_passe, role) 
      VALUES ('Administrateur', 'admin@boutique.com', ?, 'admin')
      ON DUPLICATE KEY UPDATE email = email
    `, [motDePasseHash]);

    console.log('✅ Utilisateur admin créé');
    console.log('   Email: admin@boutique.com');
    console.log('   Mot de passe: admin123');
    console.log('🎉 Initialisation terminée !');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

initializeDatabase();