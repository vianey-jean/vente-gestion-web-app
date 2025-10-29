import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productDescription, purchasePrice, sellingPrice, quantity } = await req.json();
    
    if (!productDescription) {
      throw new Error('La description du produit est requise');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY n\'est pas configurée');
    }

    // Calculer le potentiel de profit
    const profitMargin = sellingPrice && purchasePrice 
      ? ((sellingPrice - purchasePrice) / purchasePrice * 100).toFixed(1)
      : 'N/A';

    const prompt = `En tant qu'expert en marketing e-commerce, crée une description marketing captivante et professionnelle pour ce produit destinée à une marketplace en ligne.

Produit: ${productDescription}
${purchasePrice ? `Prix d'achat: ${purchasePrice}€` : ''}
${sellingPrice ? `Prix de vente: ${sellingPrice}€` : ''}
${quantity ? `Stock disponible: ${quantity} unités` : ''}
${profitMargin !== 'N/A' ? `Marge bénéficiaire: ${profitMargin}%` : ''}

La description doit:
1. Être vendeuse et persuasive (150-200 mots)
2. Mettre en avant les avantages et caractéristiques clés
3. Créer un sentiment d'urgence si le stock est limité
4. Inclure des mots-clés pertinents pour le SEO
5. Être en français, professionnelle mais accessible
6. Se terminer par un appel à l'action convaincant

Format: Retourne UNIQUEMENT la description marketing, sans titre ni formatage supplémentaire.`;

    console.log('🤖 Génération de description marketing pour:', productDescription);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un expert en copywriting marketing pour e-commerce. Tu crées des descriptions de produits qui convertissent les visiteurs en acheteurs.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur AI Gateway:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Limite de requêtes dépassée. Veuillez réessayer dans quelques instants.');
      }
      if (response.status === 402) {
        throw new Error('Crédits IA épuisés. Veuillez ajouter des crédits dans Lovable.');
      }
      
      throw new Error(`Erreur AI Gateway: ${response.status}`);
    }

    const data = await response.json();
    const marketingDescription = data.choices[0].message.content.trim();

    console.log('✅ Description générée avec succès');

    return new Response(
      JSON.stringify({ 
        success: true, 
        description: marketingDescription 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erreur:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
