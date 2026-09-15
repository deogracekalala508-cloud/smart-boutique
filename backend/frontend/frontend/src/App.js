import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [connecte, setConnecte] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
  });

  const handleLogin = async () => {
    if (!email || !motDePasse) {
      setMessage('Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await api.post('/auth/login', { 
        email, 
        mot_de_passe: motDePasse 
      });
      
      setUser(response.data.user);
      setConnecte(true);
      setMessage(`Bienvenue ${response.data.user.nom} !`);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
    } catch (error) {
      setMessage('Email ou mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setConnecte(false);
    setUser(null);
    setEmail('');
    setMotDePasse('');
    setMessage('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!connecte) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '10px',
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          width: '400px',
          textAlign: 'center'
        }}>
          <h1>🏪 Gestion Boutique</h1>
          <h2>Connexion</h2>
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              margin: '10px 0',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          />
          
          <input
            type="password"
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              margin: '10px 0',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          />
          
          <button 
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '12px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '18px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Se connecter
          </button>
          
          {message && (
            <p style={{ color: message.includes('incorrect') ? 'red' : 'green', marginTop: '15px' }}>
              {message}
            </p>
          )}
          
          <p style={{ color: '#999', fontSize: '14px', marginTop: '20px' }}>
            Démo: admin@boutique.com / admin123
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '10px',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        width: '400px',
        textAlign: 'center'
      }}>
        <h1>✅ Bienvenue {user.nom} !</h1>
        <p>Vous êtes connecté en tant que : <strong>{user.role}</strong></p>
        <p>Email : <strong>{user.email}</strong></p>
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '18px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

export default App;