const PDFDocument = require('pdfkit');
const fs = require('fs');

// Créer un PDF de test
const doc = new PDFDocument({ size: 'A5', margin: 30 });
const stream = fs.createWriteStream('test.pdf');

doc.pipe(stream);

doc.fontSize(20).font('Helvetica-Bold').text('EMBM BUSINESS', { align: 'center' });
doc.fontSize(12).text('FACTURE DE TEST', { align: 'center' });
doc.moveDown();
doc.fontSize(10).font('Helvetica');
doc.text('N° Facture : FAC-2024-0001');
doc.text('Date : ' + new Date().toLocaleString('fr-FR'));
doc.moveDown();
doc.text('Article : T-shirt Blanc');
doc.text('Quantité : 2');
doc.text('Prix : 10000 CDF');
doc.moveDown();
doc.font('Helvetica-Bold');
doc.text('TOTAL : 20000 CDF', { align: 'right' });
doc.text('≈ 7.14 USD', { align: 'right' });

doc.end();

stream.on('finish', () => {
  console.log('✅ PDF de test créé : test.pdf');
  console.log('Vérifiez dans le dossier backend !');
});

stream.on('error', (err) => {
  console.error('❌ Erreur:', err.message);
});