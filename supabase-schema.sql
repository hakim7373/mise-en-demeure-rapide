-- ─────────────────────────────────────────────────────────────
-- SCHÉMA MISE EN DEMEURE RAPIDE
-- À exécuter dans Supabase → SQL Editor
-- ─────────────────────────────────────────────────────────────

-- 1. PROFILES (infos complémentaires des utilisateurs connectés)
CREATE TABLE IF NOT EXISTS profiles (
  id        UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  prenom    TEXT,
  nom       TEXT,
  telephone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir son propre profil"     ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Modifier son propre profil" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger : crée automatiquement le profil à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, prenom, nom)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'prenom',
    NEW.raw_user_meta_data->>'nom'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- 2. LETTRES (mises en demeure créées — avec ou sans compte)
CREATE TABLE IF NOT EXISTS lettres (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tracking_id      TEXT UNIQUE DEFAULT upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  email            TEXT NOT NULL,

  -- Expéditeur
  expediteur_type  TEXT,
  expediteur_nom   TEXT,
  expediteur_adresse TEXT,
  expediteur_cp    TEXT,
  expediteur_ville TEXT,

  -- Destinataire
  destinataire_type TEXT,
  destinataire_nom  TEXT,
  destinataire_adresse TEXT,
  destinataire_cp   TEXT,
  destinataire_ville TEXT,

  -- Contenu
  litige           TEXT,
  montant          NUMERIC,
  date_fait        DATE,
  delai            INTEGER DEFAULT 15,
  description      TEXT,

  -- Statut & envoi
  statut           TEXT DEFAULT 'brouillon', -- brouillon | payee | envoyee | livree
  pdf_url          TEXT,
  ar24_id          TEXT,

  -- Paiement
  stripe_session_id TEXT,
  prix             NUMERIC DEFAULT 19.99,

  -- Dates
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  paid_at          TIMESTAMPTZ,
  sent_at          TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ
);

ALTER TABLE lettres ENABLE ROW LEVEL SECURITY;

-- Utilisateurs connectés : voient uniquement leurs lettres
CREATE POLICY "Voir ses propres lettres" ON lettres
  FOR SELECT USING (auth.uid() = user_id);

-- Insertion : autorisée pour tous (connecté ou guest, user_id peut être NULL)
CREATE POLICY "Créer une lettre" ON lettres
  FOR INSERT WITH CHECK (true);

-- Mise à jour : uniquement le propriétaire (ou via service role pour les webhooks)
CREATE POLICY "Modifier ses propres lettres" ON lettres
  FOR UPDATE USING (auth.uid() = user_id);


-- 3. SUBSCRIPTIONS (placeholder — structure prête pour les futurs plans)
CREATE TABLE IF NOT EXISTS subscriptions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_type      TEXT DEFAULT 'gratuit',
  plan_start_date TIMESTAMPTZ,
  plan_end_date   TIMESTAMPTZ,
  is_active      BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir son abonnement" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);


-- 4. INVOICES (historique paiements — placeholder)
CREATE TABLE IF NOT EXISTS invoices (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lettre_id         UUID REFERENCES lettres(id) ON DELETE SET NULL,
  amount            NUMERIC NOT NULL,
  currency          TEXT DEFAULT 'eur',
  description       TEXT,
  pdf_url           TEXT,
  status            TEXT DEFAULT 'pending', -- pending | paid | refunded
  stripe_session_id TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir ses propres factures" ON invoices
  FOR SELECT USING (auth.uid() = user_id);
