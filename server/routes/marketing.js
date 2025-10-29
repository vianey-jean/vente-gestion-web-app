const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Générer une description marketing pour un produit
router.post('/generate-description', authMiddleware, async (req, res) => {
  try {
    const { productDescription, purchasePrice, sellingPrice, quantity } = req.body;
    
    if (!productDescription) {
      return res.status(400).json({ 
        success: false, 
        error: 'La description du produit est requise' 
      });
    }

    // Calculer la marge bénéficiaire
    const profitMargin = sellingPrice && purchasePrice 
      ? ((sellingPrice - purchasePrice) / purchasePrice * 100).toFixed(1)
      : null;

    // Générer une description marketing professionnelle
    const marketingDescription = generateMarketingText(
      productDescription,
      sellingPrice,
      quantity,
      profitMargin
    );

    console.log('✅ Description marketing générée avec succès');

    res.json({
      success: true,
      description: marketingDescription
    });

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur lors de la génération' 
    });
  }
});

// Fonction pour générer du texte marketing professionnel
function generateMarketingText(description, price, stock, margin) {
  // Templates de phrases d'introduction
  const intros = [
    `Découvrez ${description} - un produit exceptionnel qui transformera votre expérience.`,
    `${description} : L'excellence à portée de main.`,
    `Faites l'expérience de la qualité supérieure avec ${description}.`,
    `${description} - Le choix parfait pour ceux qui recherchent l'excellence.`,
    `Laissez-vous séduire par ${description}, un produit d'exception.`
  ];

  // Templates de caractéristiques
  const features = [
    `Ce produit se distingue par sa qualité irréprochable et son design soigné. Chaque détail a été pensé pour vous offrir une expérience utilisateur exceptionnelle.`,
    `Alliant performance et élégance, ce produit répond aux attentes les plus exigeantes. Sa conception innovante garantit durabilité et efficacité.`,
    `Conçu avec les meilleurs matériaux, ce produit offre un rapport qualité-prix imbattable. Vous apprécierez sa robustesse et sa fiabilité.`,
    `Un produit qui allie technologie de pointe et facilité d'utilisation. Parfait pour une utilisation quotidienne, il deviendra rapidement indispensable.`,
    `La qualité premium à son meilleur niveau. Ce produit a été rigoureusement testé pour garantir votre satisfaction totale.`
  ];

  // Templates d'avantages
  const benefits = [
    `Profitez d'un produit qui simplifie votre quotidien tout en ajoutant une touche d'élégance à votre environnement.`,
    `Investissez dans la qualité et bénéficiez d'un produit durable qui vous accompagnera pendant des années.`,
    `Optimisez votre expérience avec un produit qui combine fonctionnalité et esthétique.`,
    `Faites le choix de l'excellence avec un produit qui dépasse toutes les attentes.`,
    `Transformez votre quotidien avec ce produit innovant et pratique.`
  ];

  // Templates d'appels à l'action selon le stock
  let ctas;
  if (stock && stock <= 5) {
    ctas = [
      `⚠️ STOCK LIMITÉ ! Plus que ${stock} unités disponibles. Ne manquez pas cette opportunité et commandez dès maintenant avant qu'il ne soit trop tard !`,
      `🔥 DERNIÈRES PIÈCES ! Seulement ${stock} exemplaires restants. Sécurisez le vôtre immédiatement !`,
      `⏰ ATTENTION : Stock quasi épuisé avec seulement ${stock} unités. Commandez maintenant pour ne pas le regretter !`
    ];
  } else if (stock && stock <= 10) {
    ctas = [
      `📦 Stock limité : ${stock} unités disponibles. Commandez vite pour garantir votre achat !`,
      `🎯 Offre à saisir ! ${stock} produits en stock. Ne tardez pas, ils partent vite !`,
      `💎 Disponibilité limitée avec ${stock} unités. Profitez-en avant rupture de stock !`
    ];
  } else {
    ctas = [
      `✅ Disponible immédiatement. Commandez maintenant et recevez rapidement votre produit !`,
      `🚀 En stock et prêt à être expédié. Passez votre commande dès aujourd'hui !`,
      `💯 Livraison rapide garantie. Ajoutez à votre panier et profitez-en sans attendre !`,
      `🎁 Disponible dès maintenant. Ne laissez pas passer cette opportunité !`
    ];
  }

  // Ajouter une mention de prix si disponible
  let priceSection = '';
  if (price) {
    const priceTexts = [
      `\n\n💰 Prix exceptionnel : ${price}€ seulement ! Un investissement qui en vaut vraiment la peine.`,
      `\n\n💵 Tarif imbattable : ${price}€. Un excellent rapport qualité-prix pour un produit de cette qualité.`,
      `\n\n🏷️ Offre spéciale : ${price}€. Profitez d'un prix avantageux pour un produit premium.`
    ];
    priceSection = priceTexts[Math.floor(Math.random() * priceTexts.length)];
  }

  // Ajouter une section sur la marge pour information interne (optionnelle)
  let marginInfo = '';
  if (margin && parseFloat(margin) > 20) {
    marginInfo = `\n\n✨ Excellent potentiel de revente avec une marge attractive de ${margin}%. Un produit idéal pour votre catalogue.`;
  }

  // Construire la description complète
  const intro = intros[Math.floor(Math.random() * intros.length)];
  const feature = features[Math.floor(Math.random() * features.length)];
  const benefit = benefits[Math.floor(Math.random() * benefits.length)];
  const cta = ctas[Math.floor(Math.random() * ctas.length)];

  return `${intro}\n\n${feature}\n\n${benefit}${priceSection}\n\n${cta}${marginInfo}`;
}

module.exports = router;
