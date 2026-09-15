const axios = require('axios');

async function testerInscription() {
  try {
    console.log('🧪 Test d\'inscription...\n');
    
    const donnees = {
      nom_boutique: 'Test Boutique ' + Date.now(),
      nom_admin: 'Test Admin',
      email_admin: 'test' + Date.now() + '@test.com',
      telephone: '0999068332',
      mot_de_passe: 'Test1234!',
      mot_de_passe_confirm: 'Test1234!'
    };
    
    console.log('📤 Envoi des données :');
    console.log(JSON.stringify(donnees, null, 2));
    console.log('');
    
    const response = await axios.post(
      'http://localhost:5000/api/boutiques/inscription-etape1',
      donnees,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    console.log('✅ SUCCÈS !');
    console.log('Réponse :', response.data);
    
  } catch (error) {
    console.log('❌ ERREUR !');
    if (error.response) {
      console.log('Status :', error.response.status);
      console.log('Message :', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('Pas de réponse du serveur');
      console.log('Vérifiez que le backend tourne sur http://localhost:5000');
    } else {
      console.log('Erreur :', error.message);
    }
  }
}

testerInscription();