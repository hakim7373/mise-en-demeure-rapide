import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase  = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { letterData, email, userId } = req.body;

    // 1. Sauvegarder la lettre en BDD (statut brouillon)
    const { data: lettre, error: dbError } = await supabase
      .from('lettres')
      .insert({
        user_id:             userId || null,
        email,
        expediteur_type:     letterData.expediteurType,
        expediteur_nom:      letterData.expediteurNom,
        expediteur_adresse:  letterData.expediteurAdresse,
        expediteur_cp:       letterData.expediteurCP,
        expediteur_ville:    letterData.expediteurVille,
        destinataire_type:   letterData.destinataireType,
        destinataire_nom:    letterData.destinataireNom,
        destinataire_adresse:letterData.destinataireAdresse,
        destinataire_cp:     letterData.destinataireCP,
        destinataire_ville:  letterData.destinataireVille,
        litige:              letterData.litige,
        montant:             letterData.montant || null,
        date_fait:           letterData.dateFait || null,
        delai:               letterData.delai ? parseInt(letterData.delai) : 15,
        description:         letterData.description,
        statut:              'brouillon',
        prix:                19.99,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 2. Créer la session Stripe Checkout
    const origin = req.headers.origin || 'https://mise-en-demeure-rapide.vercel.app';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Mise en demeure — Lettre recommandée AR',
            description: `Destinataire : ${letterData.destinataireNom} · Envoi LRAR inclus`,
          },
          unit_amount: 1999, // 19,99€ en centimes
        },
        quantity: 1,
      }],
      metadata: {
        lettre_id: lettre.id,
        tracking_id: lettre.tracking_id,
      },
      success_url: `${origin}/?payment=success&lettre_id=${lettre.id}&tracking=${lettre.tracking_id}`,
      cancel_url:  `${origin}/?payment=cancel`,
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ error: err.message });
  }
}
