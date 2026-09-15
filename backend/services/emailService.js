const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function verifierConfiguration() {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email non configuré dans .env');
      return false;
    }
    await transporter.verify();
    console.log('✅ Service email configuré correctement');
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration email:', error.message);
    return false;
  }
}

async function envoyerCodeVerification(email, code, nomBoutique) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('\n========================================');
      console.log('📧 MODE TEST - CODE DE VÉRIFICATION');
      console.log('========================================');
      console.log(`Email : ${email}`);
      console.log(`Boutique : ${nomBoutique}`);
      console.log(`CODE : ${code}`);
      console.log('========================================\n');
      return { success: true, mode: 'test' };
    }

    const mailOptions = {
      from: `"Smart Boutique" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🔐 Code de vérification - Smart Boutique`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #1a237e 0%, #4a148c 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 40px 30px; text-align: center; }
            .code { background: #f0f4ff; border: 2px dashed #1a237e; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .code span { font-size: 42px; font-weight: bold; color: #1a237e; letter-spacing: 10px; }
            .warning { background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; text-align: left; font-size: 13px; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏪 Smart Boutique</h1>
              <p>Vérification de votre compte</p>
            </div>
            <div class="content">
              <h2>Bonjour ${nomBoutique} 👋</h2>
              <p>Voici votre code de vérification :</p>
              <div class="code"><span>${code}</span></div>
              <p>⏱️ Valable pendant <strong>10 minutes</strong></p>
              <div class="warning">
                <strong>⚠️ Important :</strong><br>
                Ne partagez jamais ce code avec personne.
              </div>
            </div>
            <div class="footer">
              <p><strong>Smart Boutique</strong></p>
              <p>📱 WhatsApp : 0999068332</p>
              <p>📧 eventcheck.contact@gmail.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé à:', email);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Erreur envoi email:', error.message);
    // En cas d'erreur, on affiche quand même le code dans la console
    console.log('\n========================================');
    console.log('📧 CODE DE SECOURS (email non envoyé)');
    console.log('========================================');
    console.log(`Email : ${email}`);
    console.log(`CODE : ${code}`);
    console.log('========================================\n');
    return { success: false, error: error.message, code: code };
  }
}

module.exports = { envoyerCodeVerification, verifierConfiguration };