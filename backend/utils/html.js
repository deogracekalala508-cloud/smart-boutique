// Empêche le XSS stocké : tout ce qui vient de la base (nom d'article, nom de
// vendeur, nom de boutique...) doit passer par escapeHtml avant d'être inséré
// dans une réponse HTML brute (comme la facture imprimable).
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { escapeHtml };