const mysql = require('mysql2/promise');

async function supprimer() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin123',
      database: 'gestion_boutique'
    });
    
    console.log('=== SUPPRESSION DES ANCIENNES DONNEES ===\n');
    
    const [a1] = await conn.query('SELECT COUNT(*) as nb FROM articles WHERE boutique_id IS NULL');
    const [v1] = await conn.query('SELECT COUNT(*) as nb FROM ventes WHERE boutique_id IS NULL');
    const [c1] = await conn.query('SELECT COUNT(*) as nb FROM clients WHERE boutique_id IS NULL');
    
    console.log('Avant suppression :');
    console.log('  Articles sans boutique : ' + a1[0].nb);
    console.log('  Ventes sans boutique : ' + v1[0].nb);
    console.log('  Clients sans boutique : ' + c1[0].nb);
    console.log('');
    
    // Supprimer les details de ventes des anciennes ventes
    await conn.query('DELETE vd FROM ventes_details vd INNER JOIN ventes v ON vd.vente_id = v.id WHERE v.boutique_id IS NULL');
    
    // Supprimer les anciennes ventes
    const [rVentes] = await conn.query('DELETE FROM ventes WHERE boutique_id IS NULL');
    console.log('Ventes supprimees : ' + rVentes.affectedRows);
    
    // Supprimer les anciens articles
    const [rArticles] = await conn.query('DELETE FROM articles WHERE boutique_id IS NULL');
    console.log('Articles supprimes : ' + rArticles.affectedRows);
    
    // Supprimer les anciens clients
    const [rClients] = await conn.query('DELETE FROM clients WHERE boutique_id IS NULL');
    console.log('Clients supprimes : ' + rClients.affectedRows);
    
    console.log('\n✅ Anciennes donnees supprimees !\n');
    
    const [a2] = await conn.query('SELECT COUNT(*) as nb FROM articles WHERE boutique_id IS NULL');
    const [v2] = await conn.query('SELECT COUNT(*) as nb FROM ventes WHERE boutique_id IS NULL');
    
    console.log('=== APRES SUPPRESSION ===');
    console.log('  Articles sans boutique : ' + a2[0].nb);
    console.log('  Ventes sans boutique : ' + v2[0].nb);
    
    console.log('\n=== DONNEES PAR BOUTIQUE ===');
    const [boutiques] = await conn.query('SELECT id, nom FROM boutiques');
    for (const b of boutiques) {
      const [arts] = await conn.query('SELECT COUNT(*) as nb FROM articles WHERE boutique_id = ?', [b.id]);
      const [vts] = await conn.query('SELECT COUNT(*) as nb FROM ventes WHERE boutique_id = ?', [b.id]);
      const [cls] = await conn.query('SELECT COUNT(*) as nb FROM clients WHERE boutique_id = ?', [b.id]);
      console.log('  Boutique ' + b.id + ' (' + b.nom + ') : ' + arts[0].nb + ' articles, ' + vts[0].nb + ' ventes, ' + cls[0].nb + ' clients');
    }
    
    await conn.end();
    console.log('\n🎉 Termine !');
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

supprimer();