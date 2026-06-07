import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, ChevronDown, FileText, Zap, Send } from 'lucide-react';
import { supabase } from './lib/supabase';

/* ── Tokens ─────────────────────────────────────────────────── */
const F    = "'DM Sans', sans-serif";
const FSER = "'Spectral', Georgia, serif";

const C = {
  primary:        '#1A1A2E',      // quasi-noir structurel — navbar scrollée, footer
  secondary:      '#2E2E4A',
  accent:         '#C9A96E',      // champagne doré — CTAs, accents
  accentHover:    '#DBBF8A',
  bg:             '#FFFFFF',      // blanc pur — fond principal
  bgAlt:          '#F6F6F4',      // gris clair neutre — sections alternées
  bgLight:        '#EFEFED',      // gris très clair — cartes, blocs FAQ
  white:          '#FFFFFF',
  textDark:       '#111111',      // noir — titres
  textMid:        '#111111',      // noir — corps de texte
  textLight:      '#F0EDE8',      // crème — texte sur fond sombre
  textMuted:      '#222222',      // noir foncé — labels, secondaires
  textMutedLight: '#A0B0C8',      // gris — secondaires sur fond sombre
  success:        '#18753C',      // vert officiel
  borderLight:    '#E0E0DC',
  borderDark:     'rgba(201,168,76,0.25)',
  cardDark:       'rgba(255,255,255,0.05)',
};

const MAX_W = '1100px';

/* ── Helpers accord de genre ─────────────────────────────────── */
// civ = 'M.' | 'Mme' | ''   type = 'particulier' | 'professionnel'
const gA = (civ, type, masc, fem) => (type === 'professionnel' ? masc : civ === 'Mme' ? fem : masc);
const gSalut  = (civ, type) => type === 'professionnel' ? 'Madame, Monsieur,' : civ === 'Mme' ? 'Madame,' : 'Monsieur,';
const gAgree  = (civ, type) => type === 'professionnel' ? 'Madame, Monsieur' : civ === 'Mme' ? 'Madame' : 'Monsieur';

/* ── Hooks ──────────────────────────────────────────────────── */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

const useScrolled = (threshold = 40) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);
  return scrolled;
};

/* ── Scroll reveal ──────────────────────────────────────────── */
const Reveal = ({ children, delay = 0, direction = 'up', style: extraStyle = {} }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(e.target); } },
      { threshold: 0.15 }
    );
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const tx = !visible
    ? direction === 'left'  ? 'translateX(-32px)'
    : direction === 'right' ? 'translateX(32px)'
    : 'translateY(28px)'
    : 'none';
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0, transform: tx,
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      ...extraStyle,
    }}>
      {children}
    </div>
  );
};

/* ── Count-up animation ─────────────────────────────────────── */
const CountUp = ({ target, suffix = '', duration = 1800 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const p    = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(tick);
          else setVal(target);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      }
    }, { threshold: 0.15 });
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
};

/* ── Hero Document Mockup ────────────────────────────────────── */
const HeroDocMockup = () => {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
  <div style={{
    width: '370px', height: '524px',
    background: '#FFFFFF',
    borderRadius: '2px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)',
    padding: '28px 28px 24px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '7px',
    lineHeight: 1.55,
    color: '#111',
    border: '1px solid #E0E0DC',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }}>
    {/* Expéditeur — haut gauche */}
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontWeight: 700, fontSize: '7.5px' }}>Jean Dupont</div>
      <div style={{ color: '#444' }}>12 rue des Lilas</div>
      <div style={{ color: '#444' }}>75011 Paris</div>
      <div style={{ color: '#444' }}>jean.dupont@email.fr</div>
    </div>

    {/* Destinataire — droite */}
    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
      <div style={{ fontWeight: 700, fontSize: '7.5px' }}>Société</div>
      <div style={{ color: '#444' }}>45 avenue de la République</div>
      <div style={{ color: '#444' }}>69002 Lyon</div>
    </div>

    {/* Date — droite, sous destinataire */}
    <div style={{ textAlign: 'right', color: '#666', marginBottom: '14px' }}>
      Paris, le {today}
    </div>

    {/* Objet */}
    <div style={{ fontWeight: 700, textDecoration: 'underline', marginBottom: '10px' }}>
      Objet : Mise en demeure de paiement
    </div>

    {/* Corps — barres visuelles, aucun texte copiable */}
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ width: '38%', height: '6px', background: '#555', borderRadius: '2px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[100,96,99,93,97,88].map((w,i) => <div key={i} style={{ width: `${w}%`, height: '5px', background: '#bbb', borderRadius: '2px' }} />)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[100,94,98,100,91,96,85].map((w,i) => <div key={i} style={{ width: `${w}%`, height: '5px', background: '#bbb', borderRadius: '2px' }} />)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[100,97,92,100,89].map((w,i) => <div key={i} style={{ width: `${w}%`, height: '5px', background: '#bbb', borderRadius: '2px' }} />)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[72,60].map((w,i) => <div key={i} style={{ width: `${w}%`, height: '5px', background: '#bbb', borderRadius: '2px' }} />)}
      </div>
    </div>

    {/* Bas : tampon gauche + signature droite */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px', marginBottom: '70px', flexShrink: 0 }}>
      <img src="/badge_mise_en_demeure_champagne.png" alt="Badge officiel" style={{
        width: '90px', height: '90px', objectFit: 'contain',
        transform: 'rotate(-16deg)', flexShrink: 0,
        position: 'relative', left: '28px', top: '28px',
      }} />
      <div style={{ textAlign: 'right' }}>
        <svg width="72" height="28" viewBox="0 0 72 28" fill="none" style={{ filter: 'blur(1.5px)' }}>
          <path d="M4 18 C10 6 18 22 26 14 C32 8 36 20 46 16 C54 13 60 17 68 15" stroke="#222" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
          <path d="M8 23 C20 21 38 23 52 21" stroke="#222" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
        </svg>
      </div>
    </div>
  </div>
  );
};

/* ── Solution Illustration ───────────────────────────────────── */
const IlluSolution = () => (
  <div style={{
    width: '380px',
    background: '#F6F6F4',
    borderRadius: '8px',
    border: '1px solid #E0E0DC',
    padding: '2rem',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.92rem',
    color: '#111',
  }}>
    {/* Barre de progression étapes */}
    {[
      { label: 'Votre situation', done: true },
      { label: 'Rédaction automatique', done: true },
      { label: 'Envoi recommandé AR', done: true },
    ].map((step, i) => (
      <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
            background: step.done ? '#C9A96E' : '#E0E0DC',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: step.done ? '#fff' : '#888',
            fontWeight: 700, fontSize: '0.8rem',
          }}>
            {step.done ? '✓' : (i + 1)}
          </div>
          <div style={{ fontWeight: step.done ? 600 : 400, color: step.done ? '#111' : '#888', lineHeight: 1 }}>{step.label}</div>
        </div>
        {i < 2 && (
          <div style={{ width: '1px', height: '20px', background: '#E0E0DC', marginLeft: '14px', marginTop: '4px', marginBottom: '4px' }} />
        )}
      </div>
    ))}
  </div>
);

/* ── FAQ data ────────────────────────────────────────────────── */
const faqsData = [
  { q: "Combien ça coûte ?", a: "19,99€ tout compris. Ce prix inclut la rédaction personnalisée de votre mise en demeure avec les références juridiques adaptées, ainsi que l'envoi par lettre recommandée avec accusé de réception. Aucun frais caché." },
  { q: "Quelle est la différence entre une mise en demeure et une simple lettre de réclamation ?", a: "Une lettre de réclamation est un courrier informel sans portée juridique particulière. La mise en demeure, elle, est encadrée par les articles 1344 et suivants du Code civil. Elle fait courir les intérêts de retard (article 1344-1), constitue une preuve de votre démarche amiable et représente souvent un préalable obligatoire avant toute action en justice." },
  { q: "Est-ce juridiquement valide ?", a: "Oui. Chaque mise en demeure est rédigée en conformité avec le droit français (articles 1344 et suivants du Code civil). L'envoi en recommandé avec AR lui confère une valeur probante devant les tribunaux." },
  { q: "Dois-je passer par un avocat ?", a: "Non. Toute personne physique ou morale peut envoyer une mise en demeure. Ce n'est pas un acte réservé aux avocats ni aux professionnels du droit. Notre service vous aide à rédiger un courrier conforme et à l'envoyer dans les règles, sans intermédiaire juridique." },
  { q: "Quels types de litiges sont couverts ?", a: "Loyer impayé, dépôt de garantie non restitué, produit non livré ou défectueux, facture impayée, travaux inachevés, vice caché, résiliation de contrat, et bien d'autres situations du quotidien." },
  { q: "Comment se passe l'envoi en recommandé ?", a: "Vous n'avez rien à faire. Une fois votre mise en demeure validée, nous nous chargeons de l'impression et de l'envoi en lettre recommandée avec accusé de réception via La Poste." },
  { q: "Que se passe-t-il si l'autre partie ne répond pas ?", a: "Si votre mise en demeure reste sans réponse dans le délai fixé (entre 8 et 15 jours), vous êtes en droit de saisir le tribunal compétent. L'accusé de réception prouve votre tentative de résolution amiable, souvent exigée par les juges." },
  { q: "Les intérêts de retard courent-ils à partir de la mise en demeure ?", a: "Oui. Conformément à l'article 1344-1 du Code civil, les intérêts moratoires commencent à courir à compter de la réception de la mise en demeure, au taux légal en vigueur." },
  { q: "Puis-je voir ma mise en demeure avant l'envoi ?", a: "Oui. Votre mise en demeure vous est présentée avant tout paiement. Vous pouvez la relire et vérifier les informations avant de valider." },
  { q: "Est-ce que votre service constitue une consultation juridique ?", a: "Non. Notre service est un outil d'aide à la rédaction et à l'envoi de mises en demeure. Il ne constitue ni une consultation juridique ni un conseil personnalisé au sens de la loi du 31 décembre 1971. Pour les situations complexes, consultez un avocat." },
];

/* ── User menu (header — connecté) ──────────────────────────── */
const UserMenu = ({ user, onDashboard, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const prenom = user?.user_metadata?.prenom || user?.email?.split('@')[0] || 'Mon compte';

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'none', border: `1.5px solid ${C.borderLight}`,
        borderRadius: '8px', padding: '0.5rem 0.875rem', cursor: 'pointer',
        fontFamily: F, fontWeight: 600, fontSize: '0.875rem', color: C.textDark,
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; }}
      onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = C.borderLight; }}>
        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: C.primary }}>
          {prenom[0].toUpperCase()}
        </div>
        {prenom}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, minWidth: '200px',
          background: '#fff', borderRadius: '12px', border: `1px solid ${C.borderLight}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden',
        }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.borderLight}` }}>
            <p style={{ fontSize: '0.75rem', color: '#999', margin: 0 }}>{user.email}</p>
          </div>
          {[
            { label: 'Mon espace', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>, action: () => { onDashboard(); setOpen(false); } },
          ].map(item => (
            <button key={item.label} onClick={item.action} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.75rem 1rem', background: 'none', border: 'none',
              fontFamily: F, fontSize: '0.875rem', color: C.textDark, cursor: 'pointer',
              textAlign: 'left', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.bgAlt}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              {item.icon}{item.label}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${C.borderLight}` }}>
            <button onClick={() => { onLogout(); setOpen(false); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.75rem 1rem', background: 'none', border: 'none',
              fontFamily: F, fontSize: '0.875rem', color: '#EF4444', cursor: 'pointer',
              textAlign: 'left', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Auth shared components ──────────────────────────────────── */
const AuthTopBar = ({ onBack, isMobile, darkBg }) => (
  <div style={{ padding: '1.25rem clamp(1.25rem, 5vw, 2.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: 0 }}>
      <img src="/LOGO.png" alt="Logo" style={{ height: '1.75rem', width: 'auto', filter: darkBg ? 'brightness(0) invert(1)' : 'none' }} />
      {!isMobile && (
        <span style={{ fontFamily: F, fontWeight: 700, color: darkBg ? '#fff' : C.textDark, fontSize: '0.975rem', display: 'flex', flexDirection: 'column', lineHeight: 1.2, alignItems: 'flex-start' }}>
          <span>Mise en Demeure</span>
          <span style={{ color: C.accent, fontSize: '0.72rem', letterSpacing: '0.04em' }}>rapide.fr</span>
        </span>
      )}
    </button>
    <button onClick={onBack} style={{ background: 'none', border: 'none', color: darkBg ? 'rgba(255,255,255,0.6)' : C.textMid, fontFamily: F, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: 0, opacity: 0.8, transition: 'opacity 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
      onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>
      ← Retour
    </button>
  </div>
);

const AuthTrust = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
    <span style={{ fontSize: '0.72rem', color: '#aaa', letterSpacing: '0.04em' }}>Connexion sécurisée · Données chiffrées</span>
  </div>
);

/* ── Login Page ─────────────────────────────────────────────── */
const LoginPage = ({ onBack, onRegister, onForgot, onSuccess }) => {
  const isMobile = useIsMobile();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [focused, setFocused]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const fieldStyle = (name) => ({
    width: '100%', boxSizing: 'border-box',
    padding: '0.875rem 1rem',
    borderRadius: '10px',
    border: `1.5px solid ${error && (name === 'email' || name === 'pwd') ? '#EF4444' : focused === name ? C.accent : C.borderLight}`,
    fontFamily: F, fontSize: '0.9rem', color: C.textDark,
    background: '#fff', outline: 'none', transition: 'border-color 0.2s',
  });

  const handleLogin = async () => {
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect.'
        : 'Une erreur est survenue. Réessayez.');
    } else {
      onSuccess();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bgAlt, fontFamily: F, display: 'flex', flexDirection: 'column' }}>
      <AuthTopBar onBack={onBack} isMobile={isMobile} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 1.25rem 5rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: isMobile ? '2.25rem 1.75rem 2.5rem' : '3rem 2.75rem', boxShadow: '0 8px 48px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ color: C.accent, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Espace personnel</p>
            <h1 style={{ fontFamily: F, fontSize: '1.75rem', fontWeight: 700, color: C.textDark, marginBottom: '0.4rem', lineHeight: 1.2 }}>Connexion</h1>
            <p style={{ color: C.textMid, fontSize: '0.875rem', marginBottom: '2.25rem', lineHeight: 1.65, opacity: 0.55 }}>Retrouvez vos lettres et suivez vos dossiers.</p>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#DC2626' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.textDark, marginBottom: '0.45rem', letterSpacing: '0.02em' }}>Adresse e-mail</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="vous@example.com" style={fieldStyle('email')}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.textDark, marginBottom: '0.45rem', letterSpacing: '0.02em' }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  onFocus={() => setFocused('pwd')} onBlur={() => setFocused(null)}
                  placeholder="••••••••" style={{ ...fieldStyle('pwd'), paddingRight: '3rem' }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#aaa', display: 'flex', alignItems: 'center' }}>
                  {showPwd
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '1.75rem' }}>
              <button onClick={onForgot} style={{ background: 'none', border: 'none', color: C.accent, fontFamily: F, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                Mot de passe oublié ?
              </button>
            </div>

            <button onClick={handleLogin} disabled={loading} style={{
              width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none',
              background: loading ? '#999' : C.primary, color: '#fff',
              fontFamily: F, fontWeight: 700, fontSize: '0.925rem',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.secondary; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.primary; }}>
              {loading ? 'Connexion…' : 'Se connecter'}
              {!loading && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.75rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: C.borderLight }} />
              <span style={{ fontSize: '0.72rem', color: '#bbb', fontWeight: 500, letterSpacing: '0.06em' }}>OU</span>
              <div style={{ flex: 1, height: '1px', background: C.borderLight }} />
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: C.textMid, margin: 0 }}>
              Pas encore de compte ?{' '}
              <button onClick={onRegister} style={{ background: 'none', border: 'none', color: C.textDark, fontFamily: F, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', padding: 0, borderBottom: `1.5px solid ${C.accent}` }}>
                Créer un compte
              </button>
            </p>
          </div>
          <AuthTrust />
        </div>
      </div>
    </div>
  );
};

/* ── Register Page ───────────────────────────────────────────── */
const RegisterPage = ({ onBack, onLogin, onSuccess }) => {
  const isMobile = useIsMobile();
  const [form, setForm]         = useState({ prenom: '', nom: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [focused, setFocused]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  const up = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const fieldStyle = (name) => ({
    width: '100%', boxSizing: 'border-box',
    padding: '0.875rem 1rem', borderRadius: '10px',
    border: `1.5px solid ${focused === name ? C.accent : C.borderLight}`,
    fontFamily: F, fontSize: '0.9rem', color: C.textDark,
    background: '#fff', outline: 'none', transition: 'border-color 0.2s',
  });

  const handleRegister = async () => {
    if (!form.prenom || !form.nom || !form.email || !form.password) { setError('Tous les champs sont obligatoires.'); return; }
    if (form.password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { prenom: form.prenom, nom: form.nom } },
    });
    setLoading(false);
    if (err) {
      setError(err.message === 'User already registered'
        ? 'Un compte existe déjà avec cet email.'
        : 'Une erreur est survenue. Réessayez.');
    } else {
      setDone(true);
    }
  };

  if (done) return (
    <div style={{ minHeight: '100vh', background: C.bgAlt, fontFamily: F, display: 'flex', flexDirection: 'column' }}>
      <AuthTopBar onBack={onBack} isMobile={isMobile} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 1.25rem 5rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: isMobile ? '2.5rem 1.75rem' : '3rem 2.75rem', boxShadow: '0 8px 48px rgba(0,0,0,0.07)', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <p style={{ color: C.accent, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Compte créé</p>
            <h2 style={{ fontFamily: F, fontSize: '1.6rem', fontWeight: 700, color: C.textDark, marginBottom: '0.75rem' }}>Vérifiez votre email</h2>
            <p style={{ color: C.textMid, fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.7, marginBottom: '2rem' }}>
              Un lien de confirmation a été envoyé à <strong style={{ color: C.textDark, opacity: 1 }}>{form.email}</strong>.<br/>Cliquez sur le lien pour activer votre compte.
            </p>
            <button onClick={onLogin} style={{ background: C.primary, color: '#fff', width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none', fontFamily: F, fontWeight: 700, fontSize: '0.925rem', cursor: 'pointer' }}>
              Aller à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bgAlt, fontFamily: F, display: 'flex', flexDirection: 'column' }}>
      <AuthTopBar onBack={onBack} isMobile={isMobile} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 1.25rem 5rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: isMobile ? '2.25rem 1.75rem 2.5rem' : '3rem 2.75rem', boxShadow: '0 8px 48px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ color: C.accent, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Espace personnel</p>
            <h1 style={{ fontFamily: F, fontSize: '1.75rem', fontWeight: 700, color: C.textDark, marginBottom: '0.4rem', lineHeight: 1.2 }}>Créer un compte</h1>
            <p style={{ color: C.textMid, fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.65, opacity: 0.55 }}>Gérez toutes vos lettres depuis un seul endroit.</p>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#DC2626' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.textDark, marginBottom: '0.45rem' }}>Prénom</label>
                <input value={form.prenom} onChange={e => up('prenom', e.target.value)}
                  onFocus={() => setFocused('prenom')} onBlur={() => setFocused(null)}
                  placeholder="Jean" style={fieldStyle('prenom')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.textDark, marginBottom: '0.45rem' }}>Nom</label>
                <input value={form.nom} onChange={e => up('nom', e.target.value)}
                  onFocus={() => setFocused('nom')} onBlur={() => setFocused(null)}
                  placeholder="Dupont" style={fieldStyle('nom')} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.textDark, marginBottom: '0.45rem' }}>Adresse e-mail</label>
              <input type="email" value={form.email} onChange={e => up('email', e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="vous@example.com" style={fieldStyle('email')} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.textDark, marginBottom: '0.45rem' }}>Mot de passe <span style={{ fontWeight: 400, color: '#999' }}>(8 caractères min.)</span></label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => up('password', e.target.value)}
                  onFocus={() => setFocused('pwd')} onBlur={() => setFocused(null)}
                  placeholder="••••••••" style={{ ...fieldStyle('pwd'), paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#aaa', display: 'flex', alignItems: 'center' }}>
                  {showPwd
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.textDark, marginBottom: '0.45rem' }}>Confirmer le mot de passe</label>
              <input type="password" value={form.confirm} onChange={e => up('confirm', e.target.value)}
                onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                placeholder="••••••••" style={fieldStyle('confirm')}
                onKeyDown={e => e.key === 'Enter' && handleRegister()} />
            </div>

            <button onClick={handleRegister} disabled={loading} style={{
              width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none',
              background: loading ? '#999' : C.primary, color: '#fff',
              fontFamily: F, fontWeight: 700, fontSize: '0.925rem',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.secondary; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.primary; }}>
              {loading ? 'Création…' : 'Créer mon compte'}
              {!loading && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.75rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: C.borderLight }} />
              <span style={{ fontSize: '0.72rem', color: '#bbb', fontWeight: 500, letterSpacing: '0.06em' }}>OU</span>
              <div style={{ flex: 1, height: '1px', background: C.borderLight }} />
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: C.textMid, margin: 0 }}>
              Déjà un compte ?{' '}
              <button onClick={onLogin} style={{ background: 'none', border: 'none', color: C.textDark, fontFamily: F, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', padding: 0, borderBottom: `1.5px solid ${C.accent}` }}>
                Se connecter
              </button>
            </p>
          </div>
          <AuthTrust />
        </div>
      </div>
    </div>
  );
};

/* ── Forgot Password Page ────────────────────────────────────── */
const ForgotPasswordPage = ({ onBack, onLogin }) => {
  const isMobile = useIsMobile();
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [error, setError]   = useState('');

  const handleReset = async () => {
    if (!email) { setError('Veuillez saisir votre adresse email.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/?reset=true`,
    });
    setLoading(false);
    if (err) setError('Une erreur est survenue. Réessayez.');
    else setDone(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bgAlt, fontFamily: F, display: 'flex', flexDirection: 'column' }}>
      <AuthTopBar onBack={onBack} isMobile={isMobile} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 1.25rem 5rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: isMobile ? '2.25rem 1.75rem 2.5rem' : '3rem 2.75rem', boxShadow: '0 8px 48px rgba(0,0,0,0.07)' }}>
            <p style={{ color: C.accent, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Accès au compte</p>
            <h1 style={{ fontFamily: F, fontSize: '1.75rem', fontWeight: 700, color: C.textDark, marginBottom: '0.4rem', lineHeight: 1.2 }}>Mot de passe oublié</h1>

            {!done ? (
              <>
                <p style={{ color: C.textMid, fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.65, opacity: 0.55 }}>
                  Saisissez votre email — nous vous enverrons un lien de réinitialisation.
                </p>
                {error && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#DC2626' }}>{error}</div>
                )}
                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.textDark, marginBottom: '0.45rem' }}>Adresse e-mail</label>
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="vous@example.com"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.875rem 1rem', borderRadius: '10px', border: `1.5px solid ${C.borderLight}`, fontFamily: F, fontSize: '0.9rem', color: C.textDark, background: '#fff', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.borderLight}
                    onKeyDown={e => e.key === 'Enter' && handleReset()} />
                </div>
                <button onClick={handleReset} disabled={loading} style={{
                  width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none',
                  background: loading ? '#999' : C.primary, color: '#fff',
                  fontFamily: F, fontWeight: 700, fontSize: '0.925rem', cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? 'Envoi…' : 'Envoyer le lien'}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
                <div style={{ width: '64px', height: '64px', background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <p style={{ color: C.textMid, fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.7, marginBottom: '0' }}>
                  Si un compte existe avec <strong style={{ color: C.textDark, opacity: 1 }}>{email}</strong>, vous recevrez un lien dans les prochaines minutes.
                </p>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
              <button onClick={onLogin} style={{ background: 'none', border: 'none', color: C.accent, fontFamily: F, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                ← Retour à la connexion
              </button>
            </div>
          </div>
          <AuthTrust />
        </div>
      </div>
    </div>
  );
};

const FAQPage = ({ onBack, onGo }) => {
  const isMobile = useIsMobile();
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F }}>
      {/* Header */}
      <div style={{ background: C.bg, borderBottom: `1px solid ${C.borderLight}`, padding: '1.1rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 clamp(1.25rem, 5vw, 2.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.textMid, fontFamily: F, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = C.textDark}
            onMouseLeave={e => e.currentTarget.style.color = C.textMid}>
            ← Accueil
          </button>
          <button onClick={onGo} style={{ background: C.accent, color: C.textDark, padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', fontFamily: F, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Envoyer une lettre
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: isMobile ? '3rem 1.5rem 5rem' : '5rem 2.5rem 7rem' }}>
        <p style={{ color: C.accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Aide</p>
        <h1 style={{ fontFamily: F, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Questions fréquentes
        </h1>
        <p style={{ color: C.textMid, fontSize: '1rem', lineHeight: 1.7, marginBottom: '3.5rem', maxWidth: '540px' }}>
          Tout ce que vous devez savoir sur notre service de mise en demeure en ligne.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {faqsData.map(f => <FAQ key={f.q} q={f.q} a={f.a} />)}
        </div>

        <div style={{ marginTop: '3rem', padding: '1.75rem 2rem', background: C.bgAlt, borderRadius: '12px', border: `1px solid ${C.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontWeight: 700, color: C.textDark, fontSize: '0.925rem', marginBottom: '0.25rem' }}>Vous n'avez pas trouvé de réponse ?</p>
            <p style={{ color: C.textMid, fontSize: '0.85rem' }}>Notre équipe est disponible pour vous aider.</p>
          </div>
          <a href="mailto:contact@miseendemeurerapide.fr" style={{ background: C.accent, color: C.textDark, padding: '0.75rem 1.5rem', borderRadius: '8px', fontFamily: F, fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Nous contacter
          </a>
        </div>
      </div>
    </div>
  );
};

/* ── FAQ item ────────────────────────────────────────────────── */
const FAQ = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #E0E0DC' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 0', fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600, fontSize: '0.95rem', color: '#111', textAlign: 'left', gap: '1rem',
        }}>
        <span>{q}</span>
        <ChevronDown size={18} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: '#C9A96E' }} />
      </button>
      <div className={`faq-answer${open ? ' open' : ''}`}>
        <p style={{ paddingBottom: '1.25rem', color: '#333', fontSize: '0.9rem', lineHeight: 1.7 }}>{a}</p>
      </div>
    </div>
  );
};

/* ── Step illustrations ──────────────────────────────────────── */
const IlluForm = () => (
  <div style={{ background: '#fff', border: '1px solid #E0E0DC', borderRadius: '8px', padding: '1.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#111' }}>
    <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.85rem' }}>Décrivez votre situation</div>
    {[
      { label: 'Montant dû', val: '1 200 €' },
      { label: 'Type de litige', val: 'Facture impayée' },
      { label: 'Destinataire', val: 'Société XYZ SARL' },
    ].map(({ label, val }) => (
      <div key={label} style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.68rem', color: '#888', marginBottom: '0.2rem' }}>{label}</div>
        <div style={{ background: '#F6F6F4', border: '1px solid #E0E0DC', borderRadius: '5px', padding: '0.5rem 0.75rem', color: '#111', fontWeight: 500 }}>{val}</div>
      </div>
    ))}
    <div style={{ marginTop: '1.25rem', background: '#C9A96E', borderRadius: '6px', padding: '0.6rem', textAlign: 'center', color: '#111', fontWeight: 700, fontSize: '0.8rem' }}>
      Générer ma lettre →
    </div>
  </div>
);

const IlluEnvoi = () => (
  <div style={{ background: '#fff', border: '1px solid #E0E0DC', borderRadius: '10px', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif", color: '#111', width: '100%', maxWidth: '360px' }}>
    {/* En-tête */}
    <div style={{ background: '#F6F6F4', padding: '1rem 1.25rem', borderBottom: '1px solid #E0E0DC' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>Statut d'envoi</div>
    </div>
    {/* Étapes */}
    <div style={{ padding: '1.25rem' }}>
      {[
        { label: 'Rédaction de la lettre', sub: 'Courrier conforme au droit français', done: true },
        { label: 'Impression & mise sous pli', sub: 'Traitement sous 24h ouvrées', done: true },
        { label: 'Envoi en lettre recommandée', sub: 'Avec accusé de réception La Poste', done: true },
        { label: 'Accusé de réception signé', sub: 'En attente de signature', done: false },
      ].map((step, i, arr) => (
        <div key={step.label} style={{ display: 'flex', gap: '0.875rem', marginBottom: i < arr.length - 1 ? '1rem' : 0 }}>
          {/* Indicateur */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
              background: step.done ? '#C9A96E' : '#F0F0EC',
              border: `1.5px solid ${step.done ? '#C9A96E' : '#D0D0CC'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {step.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            {i < arr.length - 1 && <div style={{ width: '1px', flex: 1, background: '#E8E8E4', marginTop: '4px', minHeight: '18px' }} />}
          </div>
          {/* Texte */}
          <div style={{ paddingBottom: i < arr.length - 1 ? '0.25rem' : 0 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: step.done ? 600 : 400, color: step.done ? '#111' : '#aaa', marginBottom: '0.15rem' }}>{step.label}</div>
            <div style={{ fontSize: '0.68rem', color: step.done ? '#888' : '#ccc' }}>{step.sub}</div>
          </div>
        </div>
      ))}
    </div>
    {/* Footer partenaire */}
    <div style={{ borderTop: '1px solid #F0F0EC', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FAFAF8' }}>
      <span style={{ fontSize: '0.65rem', color: '#aaa' }}>Envoi sécurisé via</span>
      <img src="/AR24.png" alt="AR24" style={{ height: '16px', width: 'auto', display: 'block' }} />
    </div>
  </div>
);

const IlluRelance = () => (
  <div style={{ background: '#fff', border: '1px solid #E0E0DC', borderRadius: '10px', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif", color: '#111', width: '100%', maxWidth: '360px' }}>
    {/* En-tête */}
    <div style={{ background: '#F6F6F4', padding: '1rem 1.25rem', borderBottom: '1px solid #E0E0DC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>Relances automatiques</div>
      <div style={{ fontSize: '0.65rem', background: '#C9A96E22', color: '#C9A96E', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', border: '1px solid #C9A96E44' }}>Actif</div>
    </div>

    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {[
        { date: '18 avr.', label: 'Mise en demeure envoyée', sub: 'Recommandé AR — signé le 19 avr.', done: true, active: false },
        { date: '3 mai', label: 'Relance automatique J+15', sub: 'Aucune réponse — relance déclenchée', done: true, active: false },
        { date: '10 mai', label: 'Relance automatique J+22', sub: 'En cours d\'envoi…', done: false, active: true },
        { date: '18 mai', label: 'Mise en demeure finale', sub: 'Planifiée — J+30', done: false, active: false },
      ].map((item, i, arr) => (
        <div key={item.label} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
              background: item.done ? '#C9A96E' : item.active ? '#fff' : '#F0F0EC',
              border: `2px solid ${item.done ? '#C9A96E' : item.active ? '#C9A96E' : '#D8D8D4'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.done && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {item.active && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A96E' }} />}
            </div>
            {i < arr.length - 1 && <div style={{ width: '1px', flex: 1, background: '#E8E8E4', marginTop: '3px', minHeight: '20px' }} />}
          </div>
          <div style={{ paddingBottom: i < arr.length - 1 ? '0.25rem' : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
              <span style={{ fontSize: '0.65rem', color: '#C9A96E', fontWeight: 600 }}>{item.date}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: item.done || item.active ? 600 : 400, color: item.done || item.active ? '#111' : '#aaa' }}>{item.label}</span>
            </div>
            <div style={{ fontSize: '0.67rem', color: item.done ? '#888' : item.active ? '#C9A96E' : '#ccc' }}>{item.sub}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ── Sous-composants partagés Facture form ───────────────────── */
const FField = ({ label, hint, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>
      {label}{hint && <span style={{ fontWeight: 400, color: '#999', marginLeft: '0.4rem' }}>{hint}</span>}
    </label>
    {children}
  </div>
);

const FTypeBtn = ({ active, onClick, label, sub }) => (
  <button type="button" onClick={onClick} style={{
    flex: 1, padding: '1rem', borderRadius: '10px', cursor: 'pointer',
    border: `2px solid ${active ? C.accent : C.borderLight}`,
    background: active ? 'rgba(201,169,110,0.07)' : '#fff',
    fontFamily: F, textAlign: 'center', transition: 'all 0.15s',
  }}>
    <div style={{ fontWeight: 700, color: active ? C.accent : C.textDark, fontSize: '0.95rem' }}>{label}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: C.textMuted, marginTop: '0.25rem' }}>{sub}</div>}
  </button>
);

const FCheckbox = ({ checked, onChange }) => (
  <button type="button" onClick={onChange} style={{
    flexShrink: 0, width: '22px', height: '22px', borderRadius: '6px',
    border: `2px solid ${checked ? C.accent : C.borderLight}`,
    background: checked ? C.accent : '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginTop: '1px', transition: 'all 0.15s',
  }}>
    {checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
  </button>
);

const FUploadZone = ({ label, hint, required, files, onAdd, onRemove }) => {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef(null);
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const newFiles = Array.from(e.dataTransfer.files).filter(f => f.size <= 10 * 1024 * 1024);
    if (newFiles.length) onAdd(newFiles);
  };
  const handleChange = (e) => {
    const newFiles = Array.from(e.target.files).filter(f => f.size <= 10 * 1024 * 1024);
    if (newFiles.length) onAdd(newFiles);
    e.target.value = '';
  };
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.5rem' }}>
        {label}{required && <span style={{ color: C.accent, marginLeft: '0.2rem' }}>*</span>}{hint && <span style={{ fontWeight: 400, color: '#999', marginLeft: '0.4rem' }}>{hint}</span>}
      </label>
      <div onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{ border: `2px dashed ${dragging ? C.accent : C.borderLight}`, borderRadius: '10px', padding: '1.1rem 1rem', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(201,169,110,0.06)' : '#fafafa', transition: 'all 0.15s' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 0.35rem' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <div style={{ fontSize: '0.82rem', color: C.textMuted }}>Cliquez ou glissez vos fichiers ici</div>
        <div style={{ fontSize: '0.72rem', color: '#bbb', marginTop: '0.15rem' }}>PDF, JPG, PNG · 10 Mo max par fichier</div>
      </div>
      <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleChange} />
      {files.length > 0 && (
        <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {files.map((file, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.75rem', background: '#f4f4f0', borderRadius: '7px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.textDark, overflow: 'hidden', minWidth: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <span style={{ color: '#aaa', flexShrink: 0 }}>({(file.size / 1024).toFixed(0)} Ko)</span>
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); onRemove(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: '2px 0 2px 8px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SignaturePad = ({ onChange }) => {
  const canvasRef  = React.useRef(null);
  const drawing    = React.useRef(false);
  const lastPos    = React.useRef(null);
  const hasMark    = React.useRef(false);

  const xy = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const t = e.touches?.[0] ?? e;
    return [(t.clientX - r.left) * canvas.width / r.width, (t.clientY - r.top) * canvas.height / r.height];
  };
  const start = e => { e.preventDefault(); drawing.current = true; lastPos.current = xy(e, canvasRef.current); };
  const move  = e => {
    e.preventDefault();
    if (!drawing.current) return;
    const cvs = canvasRef.current, ctx = cvs.getContext('2d');
    const [x, y] = xy(e, cvs);
    ctx.beginPath(); ctx.moveTo(lastPos.current[0], lastPos.current[1]); ctx.lineTo(x, y);
    ctx.strokeStyle = '#1A1A2E'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    lastPos.current = [x, y]; hasMark.current = true;
  };
  const end   = () => { if (!drawing.current) return; drawing.current = false; if (hasMark.current) onChange(canvasRef.current.toDataURL()); };
  const clear = () => { const cvs = canvasRef.current; cvs.getContext('2d').clearRect(0,0,cvs.width,cvs.height); hasMark.current = false; onChange(null); };

  return (
    <div style={{ background: '#fafafa', border: `1.5px dashed ${C.borderLight}`, borderRadius: '10px', padding: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: C.textDark }}>Dessinez votre signature</span>
        <button type="button" onClick={clear} style={{ fontSize: '0.75rem', color: C.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>Effacer</button>
      </div>
      <canvas ref={canvasRef} width={560} height={120}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        style={{ display: 'block', width: '100%', height: '100px', cursor: 'crosshair', background: '#fff', borderRadius: '6px', border: '1px solid #eee', touchAction: 'none' }}
      />
      <div style={{ fontSize: '0.7rem', color: '#bbb', marginTop: '0.35rem', textAlign: 'center' }}>Signez avec votre souris ou votre doigt</div>
    </div>
  );
};

/* ── Formulaire Facture Impayée (9 étapes) ───────────────────── */
const FactureImpayeeForm = ({ onBack, user }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const TOTAL = 9;
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError]     = useState('');
  const [showFullLetter, setShowFullLetter] = useState(false);
  const [signature, setSignature]           = useState(null);
  const [letterH, setLetterH]               = useState(0);
  const [breakPoints, setBreakPoints]       = useState([]);
  const letterInnerRef = useRef(null);

  useEffect(() => {
    const el = letterInnerRef.current;
    if (!el) return;
    const h = el.offsetHeight;
    if (h === 0) return;

    const CONT_H = 1123 - 80 * 2; // 963px utiles par page

    // getBoundingClientRect() donne des positions viewport-relatives.
    // On soustrait le top du conteneur pour obtenir des positions relatives à lui.
    const containerTop = el.getBoundingClientRect().top;

    // Recherche récursive du meilleur saut de page avant targetY.
    // On descend dans les <div> pour trouver les vrais blocs (paragraphes, tables…).
    // Les éléments p / table / img sont traités comme atomiques (pas de coupure dedans).
    function findBreakY(parent, targetY) {
      let best = 0;
      for (const child of parent.children) {
        const r = child.getBoundingClientRect();
        const top    = r.top    - containerTop;
        const bottom = r.bottom - containerTop;

        if (bottom <= targetY) {
          best = bottom; // bloc entier avant la coupure
        } else if (top < targetY) {
          // Ce bloc chevauche la coupure
          const tag = child.tagName.toLowerCase();
          if (tag === 'div' && child.children.length > 0) {
            // Récursion dans les divs (ex : blur-div contenant les paragraphes)
            const inner = findBreakY(child, targetY);
            best = inner > best ? inner : (top > best ? top : best);
          } else {
            // Élément atomique (p, table, img…) → couper avant lui
            if (top > best) best = top;
          }
          break; // on s'arrête au premier bloc qui dépasse
        } else {
          break; // bloc après la coupure, on a fini
        }
      }
      return best;
    }

    const newBreaks = [];
    let targetY = CONT_H;
    while (targetY < h) {
      let breakY = findBreakY(el, targetY);
      const prev = newBreaks[newBreaks.length - 1] ?? 0;
      if (breakY <= prev) breakY = targetY; // fallback si bloqué
      newBreaks.push(breakY);
      targetY = breakY + CONT_H;
    }

    const same = h === letterH && newBreaks.join() === breakPoints.join();
    if (!same) { setLetterH(h); setBreakPoints(newBreaks); }
  });

  const newFacture = () => ({
    id: Date.now() + Math.random(),
    num_facture: '', date_facture: '', montant_ttc: '', montant_regle: '0', date_echeance: '',
  });

  const [form, setForm] = useState({
    creancier_type: '', creancier_civilite: '', creancier_nom: '', creancier_adresse: '', creancier_cp: '', creancier_ville: '',
    creancier_siren: '', signataire_nom: '', signataire_fonction: '', email: user?.email || '',
    debiteur_type: '', debiteur_civilite: '', debiteur_nom: '', debiteur_adresse: '', debiteur_cp: '', debiteur_ville: '',
    debiteur_siren: '', debiteur_contact: '',
    factures: [newFacture()],
    relances: false, nb_relances: '', date_derniere_relance: '', mode_relance: '',
    contestation: false, motif_contestation: '',
    reclam_principal: true, reclam_interets: false, reclam_indemnite: false, reclam_principal_seul: false,
    mode_paiement: 'virement', iban: '', bic: '', titulaire_compte: '', ordre_cheque: '', preciser_mode: '',
    delai_paiement: '15',
    tentative_amiable: false, date_tentative_amiable: '', mode_tentative: '',
    contact_amiable: true, contact_amiable_modal: 'email',
    pieces_factures: true, pieces_contrat: false, pieces_relances: false, pieces_autres: false, pieces_autres_detail: '',
  });

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const [uploadedFiles, setUploadedFiles] = useState({ factures: [], contrat: [], relances: [], autres: [] });
  const addFiles   = (key, newFiles) => setUploadedFiles(prev => ({ ...prev, [key]: [...prev[key], ...newFiles] }));
  const removeFile = (key, idx)      => setUploadedFiles(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));

  const totalDu = form.factures.reduce((sum, f) => {
    return sum + Math.max(0, (parseFloat(f.montant_ttc) || 0) - (parseFloat(f.montant_regle) || 0));
  }, 0);

  const fmtEur = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const inputStyle = {
    width: '100%', padding: '0.85rem 1rem', border: `1.5px solid ${C.borderLight}`, borderRadius: '8px',
    fontFamily: F, fontSize: '0.925rem', color: C.textDark, background: '#fff', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };
  const canNext = () => {
    if (step === 1) return !!(form.creancier_type && form.creancier_nom && form.creancier_adresse && form.creancier_cp && form.creancier_ville && form.email && form.email.includes('@'));
    if (step === 2) return !!(form.debiteur_type && form.debiteur_nom && form.debiteur_adresse && form.debiteur_cp && form.debiteur_ville);
    if (step === 3) return form.factures.length > 0 && form.factures.every(f => f.montant_ttc && f.date_echeance);
    if (step === 5) return form.reclam_principal || form.reclam_principal_seul;
    if (step === 6) return !!(form.delai_paiement && (form.mode_paiement !== 'virement' || (form.iban && form.titulaire_compte)));
    return true;
  };

  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const generateLetterBody = () => {
    const facturesLines = form.factures.map(f => {
      const solde = Math.max(0, (parseFloat(f.montant_ttc) || 0) - (parseFloat(f.montant_regle) || 0));
      const ref  = f.num_facture ? `N° ${f.num_facture}` : 'sans numéro';
      const date = f.date_facture ? ` du ${new Date(f.date_facture + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` : '';
      const ech  = f.date_echeance ? `, échue le ${new Date(f.date_echeance + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` : '';
      return `- Facture ${ref}${date}${ech} : ${fmtEur(solde)} €`;
    }).join('\n');

    let relancesText = '';
    if (form.relances && form.nb_relances) {
      const dr = form.date_derniere_relance ? ` La dernière relance a été effectuée le ${new Date(form.date_derniere_relance + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.` : '';
      relancesText = `\n\nMalgré ${form.nb_relances} relance${Number(form.nb_relances) > 1 ? 's' : ''} effectuée${Number(form.nb_relances) > 1 ? 's' : ''}, votre facture demeure impayée à ce jour.${dr}`;
    }

    let reclamsText = `\n\nJe vous réclame le règlement de la somme totale de ${fmtEur(totalDu)} € TTC`;
    if (!form.reclam_principal_seul) {
      if (form.reclam_interets) reclamsText += ', augmentée des intérêts de retard calculés conformément à l\'article L. 441-10 du Code de commerce';
      if (form.reclam_indemnite) reclamsText += ', ainsi que de l\'indemnité forfaitaire de recouvrement de 40 €';
    }
    reclamsText += '.';

    let paymentText = '';
    if (form.mode_paiement === 'virement' && form.iban) {
      paymentText = `\n\nJe vous invite à procéder au règlement par virement bancaire :\n- IBAN : ${form.iban}${form.bic ? `\n- BIC : ${form.bic}` : ''}\n- Titulaire : ${form.titulaire_compte}`;
    } else if (form.mode_paiement === 'cheque' && form.ordre_cheque) {
      paymentText = `\n\nJe vous invite à procéder au règlement par chèque à l'ordre de : ${form.ordre_cheque}`;
    } else if (form.mode_paiement === 'autre' && form.preciser_mode) {
      paymentText = `\n\nLe règlement devra être effectué par : ${form.preciser_mode}`;
    }

    let amiableText = '';
    if (form.contact_amiable) {
      const mode = { email: 'échange d\'emails', telephone: 'entretien téléphonique', courrier: 'correspondance postale' }[form.contact_amiable_modal] || 'contact direct';
      amiableText = `\n\nNous demeurons disponibles pour trouver une solution amiable à ce litige, notamment par ${mode}.`;
    }

    return `Nous vous mettons formellement en demeure de régler, dans un délai de ${form.delai_paiement} jours à compter de la réception du présent courrier, les factures ci-après détaillées :\n\n${facturesLines}\n\nMontant total dû : ${fmtEur(totalDu)} € TTC${relancesText}${reclamsText}${paymentText}${amiableText}\n\nConformément aux articles 1344 et suivants du Code civil, passé ce délai sans règlement intégral des sommes dues, je me verrai ${gA(form.creancier_civilite, form.creancier_type, 'contraint', 'contrainte')} de saisir les juridictions compétentes afin de recouvrer les sommes dues, les frais de procédure et intérêts moratoires restant à votre charge.\n\nLa présente mise en demeure est adressée en lettre recommandée avec accusé de réception, conformément à l'article 1344 du Code civil.`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: F }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.borderLight}`, padding: '1rem 0' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={step === 1 ? onBack : () => setStep(s => s - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.textMuted, fontFamily: F, fontSize: '0.875rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            {step === 1 ? 'Retour' : 'Précédent'}
          </button>
          <span style={{ fontSize: '0.8rem', color: C.textMuted, fontWeight: 600 }}>Étape {step} sur {TOTAL}</span>
        </div>
        <div style={{ maxWidth: '680px', margin: '0.75rem auto 0', padding: '0 1.5rem' }}>
          <div style={{ height: '3px', background: C.borderLight, borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / TOTAL) * 100}%`, background: C.accent, borderRadius: '99px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: isMobile ? '2rem 1.25rem' : '3rem 1.5rem' }}>

        {/* ── ÉTAPE 1 : Créancier ── */}
        {step === 1 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Facture impayée</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Vos informations</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Ces informations apparaîtront en tant que créancier sur la lettre.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <FTypeBtn active={form.creancier_type === 'particulier'}   onClick={() => up('creancier_type', 'particulier')}   label="Particulier"   sub="Une personne" />
                <FTypeBtn active={form.creancier_type === 'professionnel'} onClick={() => up('creancier_type', 'professionnel')} label="Professionnel" sub="Une entreprise" />
              </div>
              {form.creancier_type && (<>
                {form.creancier_type === 'particulier' && (
                  <FField label="Civilité">
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {['M.','Mme'].map(c => <FTypeBtn key={c} active={form.creancier_civilite===c} onClick={() => up('creancier_civilite',c)} label={c} />)}
                    </div>
                  </FField>
                )}
                <FField label={form.creancier_type === 'professionnel' ? "Nom de l'entreprise" : "Votre nom complet"}>
                  <input style={inputStyle} value={form.creancier_nom} onChange={e => up('creancier_nom', e.target.value)}
                    placeholder={form.creancier_type === 'professionnel' ? 'ex : Dupont Consulting SARL' : 'ex : Marie Dupont'}
                    onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                </FField>
                {form.creancier_type === 'professionnel' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <FField label="SIREN" hint="(optionnel)">
                      <input style={inputStyle} value={form.creancier_siren} onChange={e => up('creancier_siren', e.target.value)} placeholder="ex : 123 456 789"
                        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                    </FField>
                    <FField label="Qualité du signataire" hint="(optionnel)">
                      <input style={inputStyle} value={form.signataire_fonction} onChange={e => up('signataire_fonction', e.target.value)} placeholder="ex : Gérant, DG..."
                        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                    </FField>
                  </div>
                )}
                <FField label="Adresse">
                  <input style={inputStyle} value={form.creancier_adresse} onChange={e => up('creancier_adresse', e.target.value)} placeholder="ex : 12 rue de la Paix"
                    onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                </FField>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem' }}>
                  <FField label="Code postal">
                    <input style={inputStyle} value={form.creancier_cp} onChange={e => up('creancier_cp', e.target.value)} placeholder="75001"
                      onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </FField>
                  <FField label="Ville">
                    <input style={inputStyle} value={form.creancier_ville} onChange={e => up('creancier_ville', e.target.value)} placeholder="Paris"
                      onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </FField>
                </div>
                <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: '1.25rem', marginTop: '0.25rem' }}>
                  <FField label="Votre adresse e-mail" hint="— pour recevoir votre numéro de suivi">
                    <input style={inputStyle} type="email" value={form.email} onChange={e => up('email', e.target.value)} placeholder="vous@example.com"
                      onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </FField>
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : Débiteur ── */}
        {step === 2 && (
          <div>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Le débiteur</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>La personne ou l'entreprise qui vous doit de l'argent.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <FTypeBtn active={form.debiteur_type === 'particulier'}   onClick={() => up('debiteur_type', 'particulier')}   label="Un particulier"   sub="Une personne" />
                <FTypeBtn active={form.debiteur_type === 'professionnel'} onClick={() => up('debiteur_type', 'professionnel')} label="Un professionnel" sub="Une entreprise" />
              </div>
              {form.debiteur_type && (<>
                {form.debiteur_type === 'particulier' && (
                  <FField label="Civilité">
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {['M.','Mme'].map(c => <FTypeBtn key={c} active={form.debiteur_civilite===c} onClick={() => up('debiteur_civilite',c)} label={c} />)}
                    </div>
                  </FField>
                )}
                <FField label={form.debiteur_type === 'professionnel' ? "Nom de l'entreprise" : "Nom complet"}>
                  <input style={inputStyle} value={form.debiteur_nom} onChange={e => up('debiteur_nom', e.target.value)}
                    placeholder={form.debiteur_type === 'professionnel' ? 'ex : Client SARL' : 'ex : Jean Martin'}
                    onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                </FField>
                {form.debiteur_type === 'professionnel' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <FField label="SIREN" hint="(optionnel)">
                      <input style={inputStyle} value={form.debiteur_siren} onChange={e => up('debiteur_siren', e.target.value)} placeholder="ex : 987 654 321"
                        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                    </FField>
                    <FField label="Contact" hint="(optionnel)">
                      <input style={inputStyle} value={form.debiteur_contact} onChange={e => up('debiteur_contact', e.target.value)} placeholder="ex : M. Durand, DG"
                        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                    </FField>
                  </div>
                )}
                <FField label="Adresse">
                  <input style={inputStyle} value={form.debiteur_adresse} onChange={e => up('debiteur_adresse', e.target.value)} placeholder="ex : 5 avenue Victor Hugo"
                    onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                </FField>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem' }}>
                  <FField label="Code postal">
                    <input style={inputStyle} value={form.debiteur_cp} onChange={e => up('debiteur_cp', e.target.value)} placeholder="69001"
                      onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </FField>
                  <FField label="Ville">
                    <input style={inputStyle} value={form.debiteur_ville} onChange={e => up('debiteur_ville', e.target.value)} placeholder="Lyon"
                      onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </FField>
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : Factures ── */}
        {step === 3 && (
          <div>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Les factures impayées</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Renseignez chaque facture. Vous pouvez en ajouter plusieurs.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {form.factures.map((facture, idx) => {
                const solde = Math.max(0, (parseFloat(facture.montant_ttc) || 0) - (parseFloat(facture.montant_regle) || 0));
                const upF = (k, v) => up('factures', form.factures.map((f, i) => i === idx ? { ...f, [k]: v } : f));
                return (
                  <div key={facture.id} style={{ background: '#fff', border: `1.5px solid ${C.borderLight}`, borderRadius: '12px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <span style={{ fontWeight: 700, color: C.textDark, fontSize: '0.95rem' }}>Facture {idx + 1}</span>
                      {form.factures.length > 1 && (
                        <button type="button" onClick={() => up('factures', form.factures.filter((_, i) => i !== idx))}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.8rem', fontFamily: F, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6M14,11v6"/></svg>
                          Supprimer
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <FField label="N° de facture" hint="(optionnel)">
                          <input style={inputStyle} value={facture.num_facture} onChange={e => upF('num_facture', e.target.value)} placeholder="ex : 2025-042"
                            onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                        </FField>
                        <FField label="Date de la facture" hint="(optionnel)">
                          <input style={inputStyle} type="date" value={facture.date_facture} onChange={e => upF('date_facture', e.target.value)}
                            onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                        </FField>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <FField label="Montant TTC (€)">
                          <input style={inputStyle} type="number" step="0.01" min="0" value={facture.montant_ttc} onChange={e => upF('montant_ttc', e.target.value)} placeholder="ex : 1200"
                            onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                        </FField>
                        <FField label="Déjà réglé (€)" hint="(0 si rien)">
                          <input style={inputStyle} type="number" step="0.01" min="0" value={facture.montant_regle} onChange={e => upF('montant_regle', e.target.value)} placeholder="0"
                            onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                        </FField>
                      </div>
                      <FField label="Date d'échéance">
                        <input style={inputStyle} type="date" value={facture.date_echeance} onChange={e => upF('date_echeance', e.target.value)}
                          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                      </FField>
                      {facture.montant_ttc && (
                        <div style={{ background: 'rgba(201,169,110,0.07)', border: `1px solid rgba(201,169,110,0.25)`, borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.83rem', color: C.textMid }}>Solde restant dû</span>
                          <span style={{ fontWeight: 700, color: C.accent, fontSize: '1rem' }}>{fmtEur(solde)} €</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={() => up('factures', [...form.factures, newFacture()])}
              style={{ marginTop: '1.25rem', width: '100%', padding: '0.875rem', borderRadius: '10px', border: `2px dashed ${C.borderLight}`, background: 'none', fontFamily: F, fontWeight: 600, fontSize: '0.9rem', color: C.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'border-color 0.2s, color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.color = C.textMuted; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Ajouter une facture
            </button>
            {form.factures.some(f => f.montant_ttc) && (
              <div style={{ marginTop: '1.5rem', background: C.primary, color: '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Total dû</span>
                <span style={{ fontWeight: 800, fontSize: '1.35rem', color: C.accent }}>{fmtEur(totalDu)} €</span>
              </div>
            )}
          </div>
        )}

        {/* ── ÉTAPE 4 : Historique ── */}
        {step === 4 && (
          <div>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Historique du litige</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Ces informations permettront de contextualiser votre lettre.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Relances */}
              <div style={{ background: '#fff', border: `1.5px solid ${C.borderLight}`, borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <FCheckbox checked={form.relances} onChange={() => up('relances', !form.relances)} />
                  <div>
                    <div style={{ fontWeight: 700, color: C.textDark, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Avez-vous déjà relancé le débiteur ?</div>
                    <div style={{ fontSize: '0.82rem', color: '#888' }}>Email, téléphone, courrier simple...</div>
                  </div>
                </div>
                {form.relances && (
                  <div style={{ marginTop: '1.25rem', paddingLeft: '2.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <FField label="Nombre de relances">
                        <input style={inputStyle} type="number" min="1" value={form.nb_relances} onChange={e => up('nb_relances', e.target.value)} placeholder="ex : 3"
                          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                      </FField>
                      <FField label="Date de la dernière relance">
                        <input style={inputStyle} type="date" value={form.date_derniere_relance} onChange={e => up('date_derniere_relance', e.target.value)}
                          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                      </FField>
                    </div>
                    <FField label="Mode de relance">
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {['email', 'téléphone', 'courrier simple', 'plusieurs modes'].map(m => (
                          <button key={m} type="button" onClick={() => up('mode_relance', m)} style={{ padding: '0.5rem 0.875rem', borderRadius: '20px', border: `1.5px solid ${form.mode_relance === m ? C.accent : C.borderLight}`, background: form.mode_relance === m ? 'rgba(201,169,110,0.1)' : '#fff', fontFamily: F, fontWeight: form.mode_relance === m ? 700 : 400, fontSize: '0.82rem', color: form.mode_relance === m ? C.accent : C.textMid, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </FField>
                  </div>
                )}
              </div>
              {/* Contestation */}
              <div style={{ background: '#fff', border: `1.5px solid ${C.borderLight}`, borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <FCheckbox checked={form.contestation} onChange={() => up('contestation', !form.contestation)} />
                  <div>
                    <div style={{ fontWeight: 700, color: C.textDark, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Le débiteur conteste-t-il la dette ?</div>
                    <div style={{ fontSize: '0.82rem', color: '#888' }}>Il affirme avoir payé, nie la prestation, invoque un vice...</div>
                  </div>
                </div>
                {form.contestation && (
                  <div style={{ marginTop: '1.25rem', paddingLeft: '2.25rem' }}>
                    <FField label="Motif de la contestation">
                      <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={form.motif_contestation} onChange={e => up('motif_contestation', e.target.value)}
                        placeholder="ex : Il affirme avoir réglé la facture le 15 mars par virement..."
                        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                    </FField>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 5 : Réclamations ── */}
        {step === 5 && (
          <div>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Que réclamez-vous ?</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Sélectionnez les éléments à inclure dans votre réclamation.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { key: 'reclam_principal',      label: 'Paiement du principal',           desc: `Montant total dû : ${fmtEur(totalDu)} €`,                        disabled: false,                         exclusive: false },
                { key: 'reclam_interets',        label: 'Intérêts de retard légaux',        desc: 'Art. L.441-10 C. com — taux BCE + 10 points',                    disabled: form.reclam_principal_seul,    exclusive: false },
                { key: 'reclam_indemnite',       label: 'Indemnité forfaitaire (40 €)',     desc: 'Art. L.441-10 C. com (créances commerciales)',                    disabled: form.reclam_principal_seul,    exclusive: false },
                { key: 'reclam_principal_seul',  label: 'Principal uniquement',             desc: 'Sans intérêts ni indemnité forfaitaire',                          disabled: false,                         exclusive: true  },
              ].map(({ key, label, desc, disabled, exclusive }) => {
                const checked = form[key];
                return (
                  <button key={key} type="button" disabled={disabled} onClick={() => {
                    if (disabled) return;
                    if (exclusive && !checked) {
                      setForm(f => ({ ...f, reclam_interets: false, reclam_indemnite: false, [key]: true }));
                    } else {
                      up(key, !checked);
                    }
                  }} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem', borderRadius: '12px', border: `2px solid ${checked && !disabled ? C.accent : disabled ? '#E8E8E4' : C.borderLight}`, background: checked && !disabled ? 'rgba(201,169,110,0.07)' : disabled ? '#F8F8F6' : '#fff', cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%', fontFamily: F }}>
                    <div style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '6px', border: `2px solid ${checked && !disabled ? C.accent : disabled ? '#D0D0CC' : C.borderLight}`, background: checked && !disabled ? C.accent : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', transition: 'all 0.15s' }}>
                      {checked && !disabled && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: disabled ? '#bbb' : C.textDark, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{label}</div>
                      <div style={{ fontSize: '0.82rem', color: disabled ? '#ccc' : '#888' }}>{desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 6 : Modalités de paiement ── */}
        {step === 6 && (
          <div>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Modalités de paiement</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Comment le débiteur doit-il vous régler ?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Mode de règlement souhaité</label>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                  {[{ v: 'virement', label: 'Virement' }, { v: 'cheque', label: 'Chèque' }, { v: 'especes', label: 'Espèces' }, { v: 'autre', label: 'Autre' }].map(({ v, label }) => (
                    <button key={v} type="button" onClick={() => up('mode_paiement', v)} style={{ padding: '0.875rem 0.5rem', borderRadius: '10px', cursor: 'pointer', border: `2px solid ${form.mode_paiement === v ? C.accent : C.borderLight}`, background: form.mode_paiement === v ? 'rgba(201,169,110,0.07)' : '#fff', fontFamily: F, fontWeight: form.mode_paiement === v ? 700 : 400, fontSize: '0.88rem', color: form.mode_paiement === v ? C.accent : C.textDark, transition: 'all 0.15s' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {form.mode_paiement === 'virement' && (
                <div style={{ background: '#fff', border: `1.5px solid ${C.borderLight}`, borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <FField label="Titulaire du compte">
                    <input style={inputStyle} value={form.titulaire_compte} onChange={e => up('titulaire_compte', e.target.value)} placeholder="ex : Marie Dupont"
                      onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </FField>
                  <FField label="IBAN">
                    <input style={inputStyle} value={form.iban} onChange={e => up('iban', e.target.value.toUpperCase())} placeholder="ex : FR76 1234 5678 9012 3456 7890 123"
                      onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </FField>
                  <FField label="BIC" hint="(optionnel)">
                    <input style={inputStyle} value={form.bic} onChange={e => up('bic', e.target.value.toUpperCase())} placeholder="ex : BNPAFRPP"
                      onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </FField>
                </div>
              )}
              {form.mode_paiement === 'cheque' && (
                <div style={{ background: '#fff', border: `1.5px solid ${C.borderLight}`, borderRadius: '12px', padding: '1.5rem' }}>
                  <FField label="Chèque à l'ordre de">
                    <input style={inputStyle} value={form.ordre_cheque} onChange={e => up('ordre_cheque', e.target.value)} placeholder="ex : Marie Dupont"
                      onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </FField>
                </div>
              )}
              {form.mode_paiement === 'autre' && (
                <div style={{ background: '#fff', border: `1.5px solid ${C.borderLight}`, borderRadius: '12px', padding: '1.5rem' }}>
                  <FField label="Précisez le mode de règlement">
                    <input style={inputStyle} value={form.preciser_mode} onChange={e => up('preciser_mode', e.target.value)} placeholder="ex : Mandat postal, PayPal..."
                      onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </FField>
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Délai accordé pour le règlement</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['8', '15', '30'].map(j => (
                    <button key={j} type="button" onClick={() => up('delai_paiement', j)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', border: `2px solid ${form.delai_paiement === j ? C.accent : C.borderLight}`, background: form.delai_paiement === j ? 'rgba(201,169,110,0.07)' : '#fff', fontFamily: F, fontWeight: 700, color: form.delai_paiement === j ? C.accent : C.textDark, fontSize: '0.9rem', transition: 'all 0.15s' }}>
                      {j} jours
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 7 : Règlement amiable ── */}
        {step === 7 && (
          <div>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Règlement amiable</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Avez-vous tenté de régler ce litige à l'amiable ?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#fff', border: `1.5px solid ${C.borderLight}`, borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <FCheckbox checked={form.tentative_amiable} onChange={() => up('tentative_amiable', !form.tentative_amiable)} />
                  <div>
                    <div style={{ fontWeight: 700, color: C.textDark, fontSize: '0.95rem', marginBottom: '0.2rem' }}>J'ai tenté un règlement amiable</div>
                    <div style={{ fontSize: '0.82rem', color: '#888' }}>Discussion directe, médiation, proposition d'accord...</div>
                  </div>
                </div>
                {form.tentative_amiable && (
                  <div style={{ marginTop: '1.25rem', paddingLeft: '2.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <FField label="Date de la tentative">
                      <input style={inputStyle} type="date" value={form.date_tentative_amiable} onChange={e => up('date_tentative_amiable', e.target.value)}
                        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                    </FField>
                    <FField label="Mode de tentative">
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {['Échange direct', 'Email', 'Médiation', "Proposition d'accord"].map(m => (
                          <button key={m} type="button" onClick={() => up('mode_tentative', m)} style={{ padding: '0.5rem 0.875rem', borderRadius: '20px', border: `1.5px solid ${form.mode_tentative === m ? C.accent : C.borderLight}`, background: form.mode_tentative === m ? 'rgba(201,169,110,0.1)' : '#fff', fontFamily: F, fontWeight: form.mode_tentative === m ? 700 : 400, fontSize: '0.82rem', color: form.mode_tentative === m ? C.accent : C.textMid, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </FField>
                  </div>
                )}
              </div>
              <div style={{ background: '#fff', border: `1.5px solid ${C.borderLight}`, borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <FCheckbox checked={form.contact_amiable} onChange={() => up('contact_amiable', !form.contact_amiable)} />
                  <div>
                    <div style={{ fontWeight: 700, color: C.textDark, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Proposer un contact amiable</div>
                    <div style={{ fontSize: '0.82rem', color: '#888' }}>Mentionner dans la lettre que vous restez disponible avant d'engager une action judiciaire</div>
                  </div>
                </div>
                {form.contact_amiable && (
                  <div style={{ marginTop: '1.25rem', paddingLeft: '2.25rem' }}>
                    <FField label="Mode de contact préféré">
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {['email', 'telephone', 'courrier'].map(m => (
                          <button key={m} type="button" onClick={() => up('contact_amiable_modal', m)} style={{ padding: '0.5rem 0.875rem', borderRadius: '20px', border: `1.5px solid ${form.contact_amiable_modal === m ? C.accent : C.borderLight}`, background: form.contact_amiable_modal === m ? 'rgba(201,169,110,0.1)' : '#fff', fontFamily: F, fontWeight: form.contact_amiable_modal === m ? 700 : 400, fontSize: '0.82rem', color: form.contact_amiable_modal === m ? C.accent : C.textMid, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                            {{ email: 'E-mail', telephone: 'Téléphone', courrier: 'Courrier' }[m]}
                          </button>
                        ))}
                      </div>
                    </FField>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 8 : Pièces jointes ── */}
        {step === 8 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Facture impayée</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Pièces jointes</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Joignez les documents qui accompagneront votre mise en demeure. Ils seront transmis avec votre lettre.</p>
            <FUploadZone
              label="Copie(s) de la/des facture(s)" required
              files={uploadedFiles.factures}
              onAdd={files => addFiles('factures', files)}
              onRemove={idx => removeFile('factures', idx)}
            />
            <FUploadZone
              label="Contrat ou bon de commande" hint="(optionnel)"
              files={uploadedFiles.contrat}
              onAdd={files => addFiles('contrat', files)}
              onRemove={idx => removeFile('contrat', idx)}
            />
            <FUploadZone
              label="Preuve(s) de relance(s)" hint="(optionnel)"
              files={uploadedFiles.relances}
              onAdd={files => addFiles('relances', files)}
              onRemove={idx => removeFile('relances', idx)}
            />
            <FUploadZone
              label="Autres documents" hint="(optionnel)"
              files={uploadedFiles.autres}
              onAdd={files => addFiles('autres', files)}
              onRemove={idx => removeFile('autres', idx)}
            />
            {uploadedFiles.factures.length === 0 && (
              <div style={{ background: 'rgba(201,169,110,0.08)', border: `1px solid rgba(201,169,110,0.3)`, borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.82rem', color: C.textMid, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>Nous recommandons d'inclure au moins une copie de la facture impayée pour renforcer la valeur juridique de votre lettre.</span>
              </div>
            )}
          </div>
        )}

        {/* ── ÉTAPE 9 : Aperçu & Envoi ── */}
        {step === 9 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, margin: 0 }}>Votre lettre est prête</h1>
              <button type="button" onClick={() => setShowFullLetter(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', border: `1.5px solid ${showFullLetter ? C.accent : C.borderLight}`, background: showFullLetter ? 'rgba(201,169,110,0.1)' : '#fff', fontFamily: F, fontWeight: 600, fontSize: '0.8rem', color: showFullLetter ? C.accent : C.textMuted, cursor: 'pointer', transition: 'all 0.2s' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {showFullLetter ? 'Masquer le contenu' : 'Visualiser la lettre'}
              </button>
            </div>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Relisez votre mise en demeure avant de l'envoyer.</p>

            {/* A4 preview multi-pages */}
            {(() => {
              const A4W   = 794;
              const A4H   = 1123;
              const GUTTER = 80; // px de marge verticale dans la lettre
              const scale  = isMobile ? 0.42 : 0.68;

              const fmtDate = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('fr-FR') : '—';

              /* ── Contenu lettre ── */
              const bodyJSX = (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>{gSalut(form.debiteur_civilite, form.debiteur_type)}</div>
                  <p style={{ marginBottom: '1.25rem' }}>
                    {form.creancier_type === 'particulier' ? 'Je vous mets' : 'Nous vous mettons'} formellement en demeure de régler, dans un délai de <strong>{form.delai_paiement} jours</strong> à compter de la réception du présent courrier, les factures ci-après détaillées :
                  </p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', marginBottom: '1.25rem' }}>
                    <thead>
                      <tr style={{ background: '#f2f2f2' }}>
                        {['N° Facture','Date','Échéance','Montant TTC','Solde dû'].map(h => (
                          <th key={h} style={{ textAlign: h === 'Montant TTC' || h === 'Solde dû' ? 'right' : 'left', padding: '5px 8px', border: '1px solid #d8d8d8', fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.factures.map(f => {
                        const solde = Math.max(0, (parseFloat(f.montant_ttc) || 0) - (parseFloat(f.montant_regle) || 0));
                        return (
                          <tr key={f.id}>
                            <td style={{ padding: '5px 8px', border: '1px solid #d8d8d8' }}>{f.num_facture || '—'}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #d8d8d8' }}>{fmtDate(f.date_facture)}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #d8d8d8' }}>{fmtDate(f.date_echeance)}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #d8d8d8', textAlign: 'right' }}>{f.montant_ttc ? fmtEur(parseFloat(f.montant_ttc)) + ' €' : '—'}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #d8d8d8', textAlign: 'right', fontWeight: 700 }}>{fmtEur(solde)} €</td>
                          </tr>
                        );
                      })}
                      <tr style={{ background: '#f9f5ee' }}>
                        <td colSpan={4} style={{ padding: '5px 8px', border: '1px solid #d8d8d8', fontWeight: 700, textAlign: 'right' }}>Total dû</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #d8d8d8', fontWeight: 700, textAlign: 'right' }}>{fmtEur(totalDu)} €</td>
                      </tr>
                    </tbody>
                  </table>
                  {form.relances && form.nb_relances && (
                    <p style={{ marginBottom: '1.25rem' }}>
                      Malgré {form.nb_relances} relance{Number(form.nb_relances) > 1 ? 's' : ''} effectuée{Number(form.nb_relances) > 1 ? 's' : ''}, votre facture demeure impayée à ce jour.{form.date_derniere_relance ? ` La dernière relance a été effectuée le ${new Date(form.date_derniere_relance + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.` : ''}
                    </p>
                  )}
                  <p style={{ marginBottom: '1.25rem' }}>
                    Je vous réclame le règlement de la somme totale de <strong>{fmtEur(totalDu)} € TTC</strong>{!form.reclam_principal_seul && form.reclam_interets ? ', augmentée des intérêts de retard calculés conformément à l\'article L. 441-10 du Code de commerce' : ''}{!form.reclam_principal_seul && form.reclam_indemnite ? ', ainsi que de l\'indemnité forfaitaire de recouvrement de 40 €' : ''}.
                  </p>
                  {form.mode_paiement === 'virement' && form.iban && (<>
                    <p style={{ marginBottom: '0.6rem' }}>Je vous invite à procéder au règlement par virement bancaire aux coordonnées suivantes :</p>
                    <table style={{ borderCollapse: 'collapse', fontSize: '11.5px', marginBottom: '1.25rem' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '5px 10px', border: '1px solid #d8d8d8', fontWeight: 700, background: '#f2f2f2', whiteSpace: 'nowrap' }}>Titulaire</td>
                          <td style={{ padding: '5px 10px', border: '1px solid #d8d8d8' }}>{form.titulaire_compte || '—'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 10px', border: '1px solid #d8d8d8', fontWeight: 700, background: '#f2f2f2' }}>IBAN</td>
                          <td style={{ padding: '5px 10px', border: '1px solid #d8d8d8', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{form.iban}</td>
                        </tr>
                        {form.bic && (
                          <tr>
                            <td style={{ padding: '5px 10px', border: '1px solid #d8d8d8', fontWeight: 700, background: '#f2f2f2' }}>BIC</td>
                            <td style={{ padding: '5px 10px', border: '1px solid #d8d8d8' }}>{form.bic}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>)}
                  {form.mode_paiement === 'cheque' && form.ordre_cheque && (
                    <p style={{ marginBottom: '1.25rem' }}>Je vous invite à procéder au règlement par chèque à l'ordre de : <strong>{form.ordre_cheque}</strong>.</p>
                  )}
                  {form.mode_paiement === 'autre' && form.preciser_mode && (
                    <p style={{ marginBottom: '1.25rem' }}>Le règlement devra être effectué par : {form.preciser_mode}.</p>
                  )}
                  {form.contact_amiable && (
                    <p style={{ marginBottom: '1.25rem' }}>
                      Nous demeurons disponibles pour trouver une solution amiable à ce litige, notamment par {{ email: "échange d'emails", telephone: 'entretien téléphonique', courrier: 'correspondance postale' }[form.contact_amiable_modal] || 'contact direct'}.
                    </p>
                  )}
                  <p style={{ marginBottom: '1.25rem' }}>Conformément aux articles 1344 et suivants du Code civil, passé ce délai sans règlement intégral des sommes dues, {form.creancier_type === 'particulier' ? `je me verrai ${gA(form.creancier_civilite, form.creancier_type, 'contraint', 'contrainte')}` : 'nous nous verrons contraints'} de saisir les juridictions compétentes afin de recouvrer les sommes dues, les frais de procédure et intérêts moratoires restant à votre charge.</p>
                  <p style={{ marginBottom: '0' }}>La présente mise en demeure est adressée en lettre recommandée avec accusé de réception, conformément à l'article 1344 du Code civil.</p>
                </>
              );


              const letterJSX = (
                <>
                  {/* En-tête expéditeur */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '13.5px' }}>{form.creancier_nom}</div>
                    <div>{form.creancier_adresse}</div>
                    <div>{form.creancier_cp} {form.creancier_ville}</div>
                    {form.creancier_siren && <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>SIREN : {form.creancier_siren}</div>}
                  </div>
                  {/* Destinataire droite */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: '13.5px' }}>{form.debiteur_nom}</div>
                      <div>{form.debiteur_adresse}</div>
                      <div>{form.debiteur_cp} {form.debiteur_ville}</div>
                      {form.debiteur_siren && <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>SIREN : {form.debiteur_siren}</div>}
                    </div>
                  </div>
                  {/* Date */}
                  <div style={{ textAlign: 'right', color: '#555', marginBottom: '2rem' }}>{form.creancier_ville || 'Ville'}, le {today}</div>
                  {/* Objet */}
                  <div style={{ marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                    <div><strong>Objet :</strong> Mise en demeure de paiement — facture{form.factures.length > 1 ? 's' : ''} impayée{form.factures.length > 1 ? 's' : ''}</div>
                  </div>
                  {/* Corps floutés */}
                  <div style={{ filter: showFullLetter ? 'none' : 'blur(4px)', userSelect: showFullLetter ? 'text' : 'none', WebkitUserSelect: showFullLetter ? 'text' : 'none', transition: 'filter 0.3s' }}>
                    {bodyJSX}
                    <div style={{ marginTop: '2rem' }}>
                      Veuillez agréer, {gAgree(form.debiteur_civilite, form.debiteur_type)}, l'expression de mes salutations distinguées.
                    </div>
                  </div>
                  {/* Signature + Nom — toujours visible (hors blur) */}
                  <div style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                    {signature
                      ? <img src={signature} alt="signature" style={{ display: 'block', width: '170px', height: '58px', objectFit: 'contain', objectPosition: 'left bottom', marginBottom: '2px' }} />
                      : <div style={{ height: '44px' }} />
                    }
                    <div style={{ fontWeight: 700, fontSize: '13.5px' }}>{form.creancier_nom}</div>
                    {form.signataire_fonction && <div style={{ fontSize: '11px', color: '#666' }}>{form.signataire_fonction}</div>}
                  </div>
                </>
              );

              /* Style du contenu brut */
              const contentDivStyle = {
                width: A4W, padding: '0 80px', boxSizing: 'border-box',
                fontFamily: "'DM Sans', sans-serif", fontSize: '13px', lineHeight: 1.7,
                color: '#111', userSelect: 'none', WebkitUserSelect: 'none',
              };

              const CONTENT_H = A4H - GUTTER * 2; // 963px utiles par page

              // Calcul des tranches à partir des breakPoints détectés dans le DOM
              const ends   = [...breakPoints, letterH > 0 ? letterH : CONTENT_H];
              const slices = ends.map((end, i) => ({ start: i === 0 ? 0 : ends[i - 1], end }))
                               .filter(s => s.end > s.start);
              const numPages = slices.length || 1;

              return (
                <>
                  {/* Div de mesure hors-écran */}
                  <div ref={letterInnerRef} style={{ ...contentDivStyle, position: 'fixed', top: '-9999px', left: '-9999px', visibility: 'hidden', pointerEvents: 'none' }}>
                    {letterJSX}
                  </div>

                  {/* Feuillets A4 séparés — coupure sur vraies limites de blocs */}
                  <div style={{ background: '#d8d8d4', padding: '1.25rem 1rem', marginBottom: '2rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    {(slices.length ? slices : [{ start: 0, end: CONTENT_H }]).map(({ start, end }, pageIdx) => {
                      const sliceH = end - start;
                      return (
                        <div key={pageIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                          {numPages > 1 && (
                            <div style={{ fontSize: '0.68rem', color: '#888', marginBottom: '0.35rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                              Page {pageIdx + 1} / {numPages}
                            </div>
                          )}
                          {/* Feuillet A4 */}
                          <div style={{ width: A4W * scale, height: A4H * scale, background: '#fff', boxShadow: '0 4px 32px rgba(0,0,0,0.22)', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                            {/* Marge haute fixe */}
                            <div style={{ height: GUTTER * scale }} />
                            {/* Fenêtre de contenu = sliceH exact, pas de coupure */}
                            <div style={{ height: sliceH * scale, overflow: 'hidden', position: 'relative' }}>
                              <div style={{ ...contentDivStyle, position: 'absolute', top: -(start * scale), left: 0, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                                {letterJSX}
                              </div>
                            </div>
                            {/* Marge basse : le blanc restant remplit le A4 naturellement */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* Signature pad */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 700, color: C.textDark, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Votre signature <span style={{ fontWeight: 400, color: '#999', fontSize: '0.78rem' }}>(optionnel)</span></p>
              <SignaturePad onChange={setSignature} />
              {signature && <p style={{ fontSize: '0.75rem', color: '#66a', marginTop: '0.4rem' }}>✓ Signature enregistrée — elle apparaîtra dans votre lettre</p>}
            </div>

            {/* Pièces jointes — récap des uploads */}
            {(uploadedFiles.factures.length + uploadedFiles.contrat.length + uploadedFiles.relances.length + uploadedFiles.autres.length) > 0 && (
              <div style={{ background: '#fff', border: `1.5px solid ${C.borderLight}`, borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <p style={{ fontWeight: 700, color: C.textDark, fontSize: '0.95rem', margin: 0 }}>Pièces jointes</p>
                  <button type="button" onClick={() => setStep(8)} style={{ fontSize: '0.78rem', color: C.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, fontWeight: 600, textDecoration: 'underline' }}>Modifier</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { key: 'factures', label: 'Facture(s)' },
                    { key: 'contrat',  label: 'Contrat / bon de commande' },
                    { key: 'relances', label: 'Preuve(s) de relance' },
                    { key: 'autres',   label: 'Autres documents' },
                  ].filter(({ key }) => uploadedFiles[key].length > 0).map(({ key, label }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: C.textMid }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      <span style={{ color: C.textDark, fontWeight: 600 }}>{label}</span>
                      <span style={{ color: '#999' }}>— {uploadedFiles[key].length} fichier{uploadedFiles[key].length > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Récap */}
            <div style={{ background: 'rgba(201,169,110,0.07)', border: `1px solid rgba(201,169,110,0.25)`, borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '2rem', fontSize: '0.85rem', color: C.textMid }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 2rem' }}>
                <span>Envoi par <strong style={{ color: C.textDark }}>lettre recommandée AR</strong></span>
                <span>Délai accordé : <strong style={{ color: C.textDark }}>{form.delai_paiement} jours</strong></span>
                <span>Montant réclamé : <strong style={{ color: C.textDark }}>{fmtEur(totalDu)} €</strong></span>
              </div>
            </div>

            {paymentError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#DC2626' }}>
                {paymentError}
              </div>
            )}
            <button disabled={paymentLoading} onClick={async () => {
              setPaymentLoading(true); setPaymentError('');
              try {
                const letterData = {
                  expediteurType: form.creancier_type, expediteurNom: form.creancier_nom,
                  expediteurAdresse: form.creancier_adresse, expediteurCP: form.creancier_cp, expediteurVille: form.creancier_ville,
                  destinataireType: form.debiteur_type, destinataireNom: form.debiteur_nom,
                  destinataireAdresse: form.debiteur_adresse, destinataireCP: form.debiteur_cp, destinataireVille: form.debiteur_ville,
                  litige: 'facture', montant: totalDu.toFixed(2), delai: form.delai_paiement,
                  description: `${form.factures.length} facture(s) impayée(s)`,
                };
                const res = await fetch('/api/create-checkout-session', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ letterData, email: form.email, userId: user?.id || null }),
                });
                const json = await res.json();
                if (json.error) throw new Error(json.error);
                if (!json.url) throw new Error(`Réponse inattendue (status ${res.status})`);
                window.location.href = json.url;
              } catch (err) {
                setPaymentError(err.message || 'Une erreur est survenue. Réessayez.');
                setPaymentLoading(false);
              }
            }} style={{ width: '100%', background: paymentLoading ? '#999' : C.accent, border: 'none', padding: '1.1rem 2rem', borderRadius: '10px', fontFamily: F, fontWeight: 700, fontSize: '1.05rem', color: C.textDark, cursor: paymentLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: '0 4px 24px rgba(201,169,110,0.3)', transition: 'all 0.2s' }}>
              {paymentLoading ? 'Redirection vers le paiement…' : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>Envoyer ma lettre</>}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: C.textMuted, marginTop: '0.75rem' }}>
              Paiement sécurisé · Envoi en LRAR via La Poste · Accusé de réception inclus
            </p>
          </div>
        )}

        {/* Navigation */}
        {step < 9 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
            <button onClick={() => { if (canNext()) setStep(s => s + 1); }} style={{
              background: canNext() ? C.accent : '#E0E0DC', border: `2px solid ${canNext() ? C.accent : '#E0E0DC'}`,
              padding: '0.875rem 2rem', borderRadius: '8px', fontFamily: F, fontWeight: 700,
              fontSize: '0.9rem', color: canNext() ? C.textDark : '#999',
              cursor: canNext() ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (canNext()) { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.borderColor = C.accentHover; } }}
            onMouseLeave={e => { if (canNext()) { e.currentTarget.style.background = C.accent; e.currentTarget.style.borderColor = C.accent; } }}>
              {step === 8 ? 'Aperçu de ma lettre →' : 'Continuer →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Formulaire Loyer Impayé (8 étapes) ─────────────────────── */
const LoyerImpayeForm = ({ onBack, user }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const TOTAL = 8;
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError]     = useState('');
  const [showFullLetter, setShowFullLetter] = useState(false);
  const [signature, setSignature]           = useState(null);
  const [letterH, setLetterH]               = useState(0);
  const [breakPoints, setBreakPoints]       = useState([]);
  const letterInnerRef = useRef(null);

  useEffect(() => {
    const el = letterInnerRef.current;
    if (!el) return;
    const h = el.offsetHeight;
    if (h === 0) return;
    const CONT_H = 1123 - 80 * 2;
    const containerTop = el.getBoundingClientRect().top;
    function findBreakY(parent, targetY) {
      let best = 0;
      for (const child of parent.children) {
        const r = child.getBoundingClientRect();
        const top = r.top - containerTop, bottom = r.bottom - containerTop;
        if (bottom <= targetY) { best = bottom; }
        else if (top < targetY) {
          const tag = child.tagName.toLowerCase();
          if (tag === 'div' && child.children.length > 0) {
            const inner = findBreakY(child, targetY);
            best = inner > best ? inner : (top > best ? top : best);
          } else { if (top > best) best = top; }
          break;
        } else break;
      }
      return best;
    }
    const newBreaks = [];
    let targetY = CONT_H;
    while (targetY < h) {
      let breakY = findBreakY(el, targetY);
      const prev = newBreaks[newBreaks.length - 1] ?? 0;
      if (breakY <= prev) breakY = targetY;
      newBreaks.push(breakY);
      targetY = breakY + CONT_H;
    }
    const same = h === letterH && newBreaks.join() === breakPoints.join();
    if (!same) { setLetterH(h); setBreakPoints(newBreaks); }
  });

  const newMois = () => ({ id: Date.now() + Math.random(), periode: '', loyer: '', charges: '0', paye: '0' });

  const [form, setForm] = useState({
    bailleur_type: '', bailleur_civilite: '', bailleur_nom: '', bailleur_adresse: '', bailleur_cp: '', bailleur_ville: '',
    bailleur_email: user?.email || '', bailleur_tel: '', bailleur_siren: '',
    signataire_nom: '', signataire_fonction: '',
    locataire_type: '', locataire_civilite: '', locataire_nom: '', locataire_adresse: '', locataire_cp: '', locataire_ville: '',
    bien_adresse: '', bien_cp: '', bien_ville: '', bail_date: '', bien_type: 'logement',
    loyers: [newMois()],
    relances: false, nb_relances: '', date_derniere_relance: '',
    contestation: false,
    echeancier: false, contact_echeancier: '',
    mode_paiement: 'virement', iban: '', bic: '', titulaire_compte: '', ordre_cheque: '', preciser_mode: '',
    delai_paiement: '8',
  });
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const [uploadedFiles, setUploadedFiles] = useState({ bail: [], decompte: [], relances: [], autres: [] });
  const addFiles   = (key, files) => setUploadedFiles(p => ({ ...p, [key]: [...p[key], ...files] }));
  const removeFile = (key, idx)   => setUploadedFiles(p => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));

  const totalDu = form.loyers.reduce((sum, l) =>
    sum + Math.max(0, (parseFloat(l.loyer)||0) + (parseFloat(l.charges)||0) - (parseFloat(l.paye)||0)), 0);
  const fmtEur = n => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const inputStyle = {
    width: '100%', padding: '0.85rem 1rem', border: `1.5px solid ${C.borderLight}`, borderRadius: '8px',
    fontFamily: F, fontSize: '0.925rem', color: C.textDark, background: '#fff', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  const canNext = () => {
    if (step === 1) return !!(form.bailleur_type && form.bailleur_nom && form.bailleur_adresse && form.bailleur_cp && form.bailleur_ville && form.bailleur_email && form.bailleur_email.includes('@'));
    if (step === 2) return !!(form.locataire_type && form.locataire_nom && form.locataire_adresse && form.locataire_cp && form.locataire_ville);
    if (step === 3) return !!(form.bien_adresse && form.bien_cp && form.bien_ville && form.bail_date);
    if (step === 4) return form.loyers.length > 0 && form.loyers.every(l => l.periode && l.loyer);
    if (step === 6) return !!(form.delai_paiement && (form.mode_paiement !== 'virement' || (form.iban && form.titulaire_compte)));
    return true;
  };

  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: F }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.borderLight}`, padding: '1rem 0' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={step === 1 ? onBack : () => setStep(s => s - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.textMuted, fontFamily: F, fontSize: '0.875rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            {step === 1 ? 'Retour' : 'Précédent'}
          </button>
          <span style={{ fontSize: '0.8rem', color: C.textMuted, fontWeight: 600 }}>Étape {step} sur {TOTAL}</span>
        </div>
        <div style={{ maxWidth: '680px', margin: '0.75rem auto 0', padding: '0 1.5rem' }}>
          <div style={{ height: '3px', background: C.borderLight, borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step/TOTAL)*100}%`, background: C.accent, borderRadius: '99px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: isMobile ? '2rem 1.25rem' : '3rem 1.5rem' }}>

        {/* ── ÉTAPE 1 : Bailleur ── */}
        {step === 1 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Loyer impayé</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Vos informations</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Vous êtes le bailleur (propriétaire ou gestionnaire).</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <FTypeBtn active={form.bailleur_type==='particulier'}   onClick={() => up('bailleur_type','particulier')}   label="Particulier"   sub="Propriétaire personne physique" />
                <FTypeBtn active={form.bailleur_type==='professionnel'} onClick={() => up('bailleur_type','professionnel')} label="Professionnel" sub="SCI, agence, société…" />
              </div>
              {form.bailleur_type && (<>
                {form.bailleur_type==='particulier' && (
                  <FField label="Civilité">
                    <div style={{ display:'flex', gap:'0.75rem' }}>
                      {['M.','Mme'].map(c => <FTypeBtn key={c} active={form.bailleur_civilite===c} onClick={() => up('bailleur_civilite',c)} label={c} />)}
                    </div>
                  </FField>
                )}
                <FField label={form.bailleur_type==='professionnel' ? "Raison sociale" : "Votre nom complet"}>
                  <input style={inputStyle} value={form.bailleur_nom} onChange={e => up('bailleur_nom', e.target.value)}
                    placeholder={form.bailleur_type==='professionnel' ? 'ex : SCI Dupont Immobilier' : 'ex : Marie Dupont'}
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
                {form.bailleur_type==='professionnel' && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                    <FField label="SIREN/SIRET" hint="(optionnel)">
                      <input style={inputStyle} value={form.bailleur_siren} onChange={e => up('bailleur_siren', e.target.value)} placeholder="ex : 123 456 789"
                        onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                    </FField>
                    <FField label="Qualité du signataire" hint="(optionnel)">
                      <input style={inputStyle} value={form.signataire_fonction} onChange={e => up('signataire_fonction', e.target.value)} placeholder="ex : Gérant"
                        onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                    </FField>
                  </div>
                )}
                <FField label="Adresse">
                  <input style={inputStyle} value={form.bailleur_adresse} onChange={e => up('bailleur_adresse', e.target.value)} placeholder="ex : 12 rue de la Paix"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
                <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:'0.75rem' }}>
                  <FField label="Code postal">
                    <input style={inputStyle} value={form.bailleur_cp} onChange={e => up('bailleur_cp', e.target.value)} placeholder="75001"
                      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                  </FField>
                  <FField label="Ville">
                    <input style={inputStyle} value={form.bailleur_ville} onChange={e => up('bailleur_ville', e.target.value)} placeholder="Paris"
                      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                  </FField>
                </div>
                <FField label="Email">
                  <input style={inputStyle} type="email" value={form.bailleur_email} onChange={e => up('bailleur_email', e.target.value)} placeholder="votre@email.fr"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
                <FField label="Téléphone" hint="(optionnel)">
                  <input style={inputStyle} value={form.bailleur_tel} onChange={e => up('bailleur_tel', e.target.value)} placeholder="06 00 00 00 00"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
              </>)}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : Locataire ── */}
        {step === 2 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Loyer impayé</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Le locataire</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Informations sur le destinataire de la mise en demeure.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <FTypeBtn active={form.locataire_type==='particulier'}   onClick={() => up('locataire_type','particulier')}   label="Particulier"   sub="Personne physique" />
                <FTypeBtn active={form.locataire_type==='professionnel'} onClick={() => up('locataire_type','professionnel')} label="Professionnel" sub="Société, association…" />
              </div>
              {form.locataire_type && (<>
                {form.locataire_type==='particulier' && (
                  <FField label="Civilité">
                    <div style={{ display:'flex', gap:'0.75rem' }}>
                      {['M.','Mme'].map(c => <FTypeBtn key={c} active={form.locataire_civilite===c} onClick={() => up('locataire_civilite',c)} label={c} />)}
                    </div>
                  </FField>
                )}
                <FField label={form.locataire_type==='professionnel' ? "Raison sociale" : "Nom complet du locataire"}>
                  <input style={inputStyle} value={form.locataire_nom} onChange={e => up('locataire_nom', e.target.value)} placeholder="ex : Jean Martin"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
                <FField label="Adresse du locataire" hint="(si différente du logement loué)">
                  <input style={inputStyle} value={form.locataire_adresse} onChange={e => up('locataire_adresse', e.target.value)} placeholder="ex : 5 avenue des Fleurs"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
                <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:'0.75rem' }}>
                  <FField label="Code postal">
                    <input style={inputStyle} value={form.locataire_cp} onChange={e => up('locataire_cp', e.target.value)} placeholder="75002"
                      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                  </FField>
                  <FField label="Ville">
                    <input style={inputStyle} value={form.locataire_ville} onChange={e => up('locataire_ville', e.target.value)} placeholder="Paris"
                      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                  </FField>
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : Bien loué & Bail ── */}
        {step === 3 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Loyer impayé</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Le bien loué</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Informations sur le logement et le contrat de location.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <FField label="Type de bien">
                <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                  {[['logement','Logement'],['local','Local commercial'],['parking','Parking'],['autre','Autre']].map(([v,l]) => (
                    <button key={v} type="button" onClick={() => up('bien_type', v)} style={{ padding:'0.5rem 0.875rem', borderRadius:'20px', border:`1.5px solid ${form.bien_type===v ? C.accent : C.borderLight}`, background: form.bien_type===v ? 'rgba(201,169,110,0.1)' : '#fff', fontFamily:F, fontWeight: form.bien_type===v ? 700 : 400, fontSize:'0.82rem', color: form.bien_type===v ? C.accent : C.textMid, cursor:'pointer', transition:'all 0.15s' }}>{l}</button>
                  ))}
                </div>
              </FField>
              <FField label="Adresse du bien loué">
                <input style={inputStyle} value={form.bien_adresse} onChange={e => up('bien_adresse', e.target.value)} placeholder="ex : 8 rue Victor Hugo"
                  onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
              </FField>
              <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:'0.75rem' }}>
                <FField label="Code postal">
                  <input style={inputStyle} value={form.bien_cp} onChange={e => up('bien_cp', e.target.value)} placeholder="75003"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
                <FField label="Ville">
                  <input style={inputStyle} value={form.bien_ville} onChange={e => up('bien_ville', e.target.value)} placeholder="Paris"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
              </div>
              <FField label="Date de signature du bail">
                <input style={inputStyle} type="date" value={form.bail_date} onChange={e => up('bail_date', e.target.value)}
                  onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
              </FField>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 4 : Impayés ── */}
        {step === 4 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Loyer impayé</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Loyers & charges impayés</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Ajoutez chaque période impayée. Le solde est calculé automatiquement.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {form.loyers.map((l, idx) => {
                const solde = Math.max(0, (parseFloat(l.loyer)||0) + (parseFloat(l.charges)||0) - (parseFloat(l.paye)||0));
                return (
                  <div key={l.id} style={{ background:'#fff', border:`1.5px solid ${C.borderLight}`, borderRadius:'12px', padding:'1.25rem' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                      <span style={{ fontWeight:700, color:C.textDark, fontSize:'0.9rem' }}>Période {idx+1}</span>
                      {form.loyers.length > 1 && (
                        <button type="button" onClick={() => up('loyers', form.loyers.filter((_,i) => i !== idx))} style={{ background:'none', border:'none', cursor:'pointer', color:'#999', fontSize:'0.8rem', fontFamily:F }}>Supprimer</button>
                      )}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                      <FField label="Période concernée">
                        <input style={inputStyle} value={l.periode} onChange={e => up('loyers', form.loyers.map((x,i) => i===idx ? {...x, periode: e.target.value} : x))} placeholder="ex : Janvier 2025"
                          onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                      </FField>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                        <FField label="Loyer dû (€)">
                          <input style={inputStyle} type="number" min="0" value={l.loyer} onChange={e => up('loyers', form.loyers.map((x,i) => i===idx ? {...x, loyer: e.target.value} : x))} placeholder="ex : 800"
                            onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                        </FField>
                        <FField label="Charges dues (€)">
                          <input style={inputStyle} type="number" min="0" value={l.charges} onChange={e => up('loyers', form.loyers.map((x,i) => i===idx ? {...x, charges: e.target.value} : x))} placeholder="ex : 80"
                            onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                        </FField>
                      </div>
                      <FField label="Montant déjà réglé (€)">
                        <input style={inputStyle} type="number" min="0" value={l.paye} onChange={e => up('loyers', form.loyers.map((x,i) => i===idx ? {...x, paye: e.target.value} : x))} placeholder="0"
                          onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                      </FField>
                      <div style={{ background:'rgba(201,169,110,0.07)', borderRadius:'8px', padding:'0.75rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:'0.85rem', color:C.textMid }}>Solde restant dû</span>
                        <span style={{ fontWeight:700, color:C.accent, fontSize:'1rem' }}>{fmtEur(solde)} €</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button type="button" onClick={() => up('loyers', [...form.loyers, newMois()])} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.875rem', borderRadius:'10px', border:`2px dashed ${C.borderLight}`, background:'transparent', fontFamily:F, fontWeight:600, fontSize:'0.875rem', color:C.textMid, cursor:'pointer', transition:'all 0.15s' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Ajouter une période
              </button>
              {form.loyers.length > 0 && (
                <div style={{ background:C.primary, borderRadius:'10px', padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.9rem', fontWeight:600 }}>Total dû</span>
                  <span style={{ color:C.accent, fontWeight:700, fontSize:'1.2rem' }}>{fmtEur(totalDu)} €</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 5 : Contexte ── */}
        {step === 5 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Loyer impayé</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Historique & contexte</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Ces informations personnalisent la lettre et renforcent sa valeur juridique.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {/* Relances */}
              <div style={{ background:'#fff', border:`1.5px solid ${C.borderLight}`, borderRadius:'12px', padding:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'1rem' }}>
                  <FCheckbox checked={form.relances} onChange={() => up('relances', !form.relances)} />
                  <div>
                    <div style={{ fontWeight:700, color:C.textDark, fontSize:'0.95rem', marginBottom:'0.2rem' }}>Des relances ont déjà été effectuées</div>
                    <div style={{ fontSize:'0.82rem', color:'#888' }}>Courriers, emails, appels téléphoniques…</div>
                  </div>
                </div>
                {form.relances && (
                  <div style={{ marginTop:'1.25rem', paddingLeft:'2.25rem', display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                      <FField label="Nombre de relances">
                        <input style={inputStyle} type="number" min="1" value={form.nb_relances} onChange={e => up('nb_relances', e.target.value)} placeholder="ex : 2"
                          onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                      </FField>
                      <FField label="Date de la dernière relance">
                        <input style={inputStyle} type="date" value={form.date_derniere_relance} onChange={e => up('date_derniere_relance', e.target.value)}
                          onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                      </FField>
                    </div>
                  </div>
                )}
              </div>
              {/* Contestation */}
              <div style={{ background:'#fff', border:`1.5px solid ${C.borderLight}`, borderRadius:'12px', padding:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'1rem' }}>
                  <FCheckbox checked={form.contestation} onChange={() => up('contestation', !form.contestation)} />
                  <div>
                    <div style={{ fontWeight:700, color:C.textDark, fontSize:'0.95rem', marginBottom:'0.2rem' }}>Le locataire conteste les sommes</div>
                    <div style={{ fontSize:'0.82rem', color:'#888' }}>Ajoute un paragraphe demandant une contestation écrite et motivée.</div>
                  </div>
                </div>
              </div>
              {/* Échéancier */}
              <div style={{ background:'#fff', border:`1.5px solid ${C.borderLight}`, borderRadius:'12px', padding:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'1rem' }}>
                  <FCheckbox checked={form.echeancier} onChange={() => up('echeancier', !form.echeancier)} />
                  <div>
                    <div style={{ fontWeight:700, color:C.textDark, fontSize:'0.95rem', marginBottom:'0.2rem' }}>Ouvert à un échéancier de paiement</div>
                    <div style={{ fontSize:'0.82rem', color:'#888' }}>Propose une solution amiable si difficultés passagères.</div>
                  </div>
                </div>
                {form.echeancier && (
                  <div style={{ marginTop:'1.25rem', paddingLeft:'2.25rem' }}>
                    <FField label="Contact pour l'échéancier" hint="(téléphone ou email)">
                      <input style={inputStyle} value={form.contact_echeancier} onChange={e => up('contact_echeancier', e.target.value)} placeholder="ex : 06 00 00 00 00 / contact@email.fr"
                        onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                    </FField>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 6 : Modalités de paiement ── */}
        {step === 6 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Loyer impayé</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Modalités de paiement</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Comment souhaitez-vous être remboursé(e) ?</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <FTypeBtn active={form.mode_paiement==='virement'}  onClick={() => up('mode_paiement','virement')}  label="Virement"  sub="IBAN / BIC" />
                <FTypeBtn active={form.mode_paiement==='cheque'}    onClick={() => up('mode_paiement','cheque')}    label="Chèque"    sub="À l'ordre de…" />
                <FTypeBtn active={form.mode_paiement==='autre'}     onClick={() => up('mode_paiement','autre')}     label="Autre"     sub="À préciser" />
              </div>
              {form.mode_paiement==='virement' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                  <FField label="Titulaire du compte">
                    <input style={inputStyle} value={form.titulaire_compte} onChange={e => up('titulaire_compte', e.target.value)} placeholder="Nom du titulaire"
                      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                  </FField>
                  <FField label="IBAN">
                    <input style={inputStyle} value={form.iban} onChange={e => up('iban', e.target.value)} placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                  </FField>
                  <FField label="BIC" hint="(optionnel)">
                    <input style={inputStyle} value={form.bic} onChange={e => up('bic', e.target.value)} placeholder="ex : BNPAFRPP"
                      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                  </FField>
                </div>
              )}
              {form.mode_paiement==='cheque' && (
                <FField label="Chèque à l'ordre de">
                  <input style={inputStyle} value={form.ordre_cheque} onChange={e => up('ordre_cheque', e.target.value)} placeholder="ex : Marie Dupont"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
              )}
              {form.mode_paiement==='autre' && (
                <FField label="Préciser le mode de paiement">
                  <input style={inputStyle} value={form.preciser_mode} onChange={e => up('preciser_mode', e.target.value)} placeholder="ex : Espèces contre reçu"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
              )}
              <FField label="Délai accordé pour le règlement">
                <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                  {[['8','8 jours'],['15','15 jours'],['30','30 jours']].map(([v,l]) => (
                    <button key={v} type="button" onClick={() => up('delai_paiement', v)} style={{ padding:'0.5rem 0.875rem', borderRadius:'20px', border:`1.5px solid ${form.delai_paiement===v ? C.accent : C.borderLight}`, background: form.delai_paiement===v ? 'rgba(201,169,110,0.1)' : '#fff', fontFamily:F, fontWeight: form.delai_paiement===v ? 700 : 400, fontSize:'0.82rem', color: form.delai_paiement===v ? C.accent : C.textMid, cursor:'pointer', transition:'all 0.15s' }}>{l}</button>
                  ))}
                  <input style={{ ...inputStyle, width:'100px', padding:'0.5rem 0.75rem' }} type="number" min="1" placeholder="Autre…"
                    value={['8','15','30'].includes(form.delai_paiement) ? '' : form.delai_paiement}
                    onChange={e => up('delai_paiement', e.target.value)}
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </div>
              </FField>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 7 : Pièces jointes ── */}
        {step === 7 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Loyer impayé</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Pièces jointes</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Joignez les documents qui accompagneront votre mise en demeure.</p>
            <FUploadZone label="Copie du contrat de bail" required files={uploadedFiles.bail} onAdd={f => addFiles('bail',f)} onRemove={i => removeFile('bail',i)} />
            <FUploadZone label="Décompte des loyers / relevé d'impayés" hint="(optionnel)" files={uploadedFiles.decompte} onAdd={f => addFiles('decompte',f)} onRemove={i => removeFile('decompte',i)} />
            <FUploadZone label="Preuve(s) de relance(s)" hint="(optionnel)" files={uploadedFiles.relances} onAdd={f => addFiles('relances',f)} onRemove={i => removeFile('relances',i)} />
            <FUploadZone label="Autres documents" hint="(optionnel)" files={uploadedFiles.autres} onAdd={f => addFiles('autres',f)} onRemove={i => removeFile('autres',i)} />
            {uploadedFiles.bail.length === 0 && (
              <div style={{ background:'rgba(201,169,110,0.08)', border:`1px solid rgba(201,169,110,0.3)`, borderRadius:'8px', padding:'0.75rem 1rem', fontSize:'0.82rem', color:C.textMid, display:'flex', gap:'0.5rem', alignItems:'flex-start' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:'1px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>Nous recommandons d'inclure une copie du bail pour renforcer la valeur juridique de votre courrier.</span>
              </div>
            )}
          </div>
        )}

        {/* ── ÉTAPE 8 : Aperçu & Envoi ── */}
        {step === 8 && (() => {
          const A4W = 794, A4H = 1123, GUTTER = 80, CONTENT_H = A4H - GUTTER * 2;
          const scale = isMobile ? 0.42 : 0.68;
          const fmtDate = d => d ? new Date(d+'T12:00:00').toLocaleDateString('fr-FR') : '—';
          const bailDateFmt = form.bail_date ? new Date(form.bail_date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}) : '—';

          const bodyJSX = (
            <>
              <p style={{ marginBottom:'1.25rem' }}>
                Je me permets de vous contacter concernant le contrat de location conclu le <strong>{bailDateFmt}</strong>, portant sur le {form.bien_type==='logement' ? 'logement' : form.bien_type==='local' ? 'local commercial' : 'bien'} situé à l'adresse suivante : <strong>{form.bien_adresse}{form.bien_cp ? `, ${form.bien_cp}` : ''}{form.bien_ville ? ` ${form.bien_ville}` : ''}</strong>.
              </p>
              <p style={{ marginBottom:'1.25rem' }}>
                Aux termes de ce contrat de location, vous êtes {gA(form.locataire_civilite, form.locataire_type, 'tenu', 'tenue')} de régler le loyer et les charges locatives aux échéances convenues. Or, sauf erreur ou omission de ma part, plusieurs sommes demeurent impayées à ce jour au titre de votre occupation du logement.
              </p>
              <p style={{ marginBottom:'0.75rem' }}>
                {form.loyers.length > 1 ? 'Les sommes impayées sont les suivantes :' : "L'impayé concerne l'échéance suivante :"}
              </p>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11.5px', marginBottom:'1.25rem' }}>
                <thead>
                  <tr style={{ background:'#f2f2f2' }}>
                    {['Période','Loyer dû','Charges','Déjà réglé','Solde dû'].map(h => (
                      <th key={h} style={{ textAlign: h==='Période' ? 'left' : 'right', padding:'5px 8px', border:'1px solid #d8d8d8', fontWeight:700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {form.loyers.map(l => {
                    const solde = Math.max(0,(parseFloat(l.loyer)||0)+(parseFloat(l.charges)||0)-(parseFloat(l.paye)||0));
                    return (
                      <tr key={l.id}>
                        <td style={{ padding:'5px 8px', border:'1px solid #d8d8d8' }}>{l.periode||'—'}</td>
                        <td style={{ padding:'5px 8px', border:'1px solid #d8d8d8', textAlign:'right' }}>{l.loyer ? fmtEur(parseFloat(l.loyer))+' €' : '—'}</td>
                        <td style={{ padding:'5px 8px', border:'1px solid #d8d8d8', textAlign:'right' }}>{l.charges && parseFloat(l.charges)>0 ? fmtEur(parseFloat(l.charges))+' €' : '—'}</td>
                        <td style={{ padding:'5px 8px', border:'1px solid #d8d8d8', textAlign:'right' }}>{l.paye && parseFloat(l.paye)>0 ? fmtEur(parseFloat(l.paye))+' €' : '—'}</td>
                        <td style={{ padding:'5px 8px', border:'1px solid #d8d8d8', textAlign:'right', fontWeight:700 }}>{fmtEur(solde)} €</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background:'#f9f5ee' }}>
                    <td colSpan={4} style={{ padding:'5px 8px', border:'1px solid #d8d8d8', fontWeight:700, textAlign:'right' }}>Total dû</td>
                    <td style={{ padding:'5px 8px', border:'1px solid #d8d8d8', fontWeight:700, textAlign:'right' }}>{fmtEur(totalDu)} €</td>
                  </tr>
                </tbody>
              </table>
              {form.relances && form.nb_relances && (
                <p style={{ marginBottom:'1.25rem' }}>
                  Malgré mes précédentes relances{form.nb_relances ? ` (${form.nb_relances} au total)` : ''}{form.date_derniere_relance ? `, dont la dernière en date du ${new Date(form.date_derniere_relance+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}` : ''}, aucun règlement complet ne m'est parvenu à ce jour.
                </p>
              )}
              <p style={{ marginBottom:'1.25rem' }}>
                Votre absence de paiement constitue un manquement grave à vos obligations contractuelles de locataire, notamment à votre obligation de payer le loyer et les charges récupérables aux termes convenus.
              </p>
              <p style={{ marginBottom:'1.25rem' }}>
                Par la présente, je vous mets donc formellement en demeure de procéder au règlement intégral de la somme de <strong>{fmtEur(totalDu)} €</strong> dans un délai de <strong>{form.delai_paiement} jours</strong> à compter de la réception de ce courrier.
              </p>
              {form.mode_paiement==='virement' && form.iban && (<>
                <p style={{ marginBottom:'0.6rem' }}>Le paiement devra être effectué par virement bancaire aux coordonnées suivantes :</p>
                <table style={{ borderCollapse:'collapse', fontSize:'11.5px', marginBottom:'1.25rem' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding:'5px 10px', border:'1px solid #d8d8d8', fontWeight:700, background:'#f2f2f2', whiteSpace:'nowrap' }}>Titulaire</td>
                      <td style={{ padding:'5px 10px', border:'1px solid #d8d8d8' }}>{form.titulaire_compte||'—'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding:'5px 10px', border:'1px solid #d8d8d8', fontWeight:700, background:'#f2f2f2' }}>IBAN</td>
                      <td style={{ padding:'5px 10px', border:'1px solid #d8d8d8', fontFamily:'monospace', letterSpacing:'0.04em' }}>{form.iban}</td>
                    </tr>
                    {form.bic && <tr>
                      <td style={{ padding:'5px 10px', border:'1px solid #d8d8d8', fontWeight:700, background:'#f2f2f2' }}>BIC</td>
                      <td style={{ padding:'5px 10px', border:'1px solid #d8d8d8' }}>{form.bic}</td>
                    </tr>}
                  </tbody>
                </table>
              </>)}
              {form.mode_paiement==='cheque' && form.ordre_cheque && (
                <p style={{ marginBottom:'1.25rem' }}>Le paiement devra être effectué par chèque à l'ordre de : <strong>{form.ordre_cheque}</strong>.</p>
              )}
              {form.mode_paiement==='autre' && form.preciser_mode && (
                <p style={{ marginBottom:'1.25rem' }}>Le paiement devra être effectué par : {form.preciser_mode}.</p>
              )}
              {form.echeancier && (
                <p style={{ marginBottom:'1.25rem' }}>
                  Si cette situation résulte de difficultés passagères, je reste {gA(form.bailleur_civilite, form.bailleur_type, 'disposé', 'disposée')} à examiner une solution amiable, notamment la mise en place d'un échéancier écrit{form.contact_echeancier ? `. Dans ce cas, je vous invite à me contacter dans les plus brefs délais au ${form.contact_echeancier}` : ''}.
                </p>
              )}
              {form.contestation && (
                <p style={{ marginBottom:'1.25rem' }}>
                  Par ailleurs, j'ai pris note de vos réserves concernant les sommes réclamées. Afin de permettre l'examen de votre contestation, je vous remercie de bien vouloir me transmettre, dans le même délai, l'ensemble de vos motifs précis, écrits et justifiés, accompagnés de tout justificatif utile.
                </p>
              )}
              <p style={{ marginBottom:'1.25rem' }}>
                À défaut de paiement intégral, d'accord écrit ou de contestation sérieuse et motivée dans le délai imparti, je me réserve le droit d'engager, sans nouvelle relance, toute procédure utile à la préservation de mes droits. Cette procédure pourra notamment comprendre la saisine d'un commissaire de justice aux fins de délivrance d'un commandement de payer visant la clause résolutoire de votre bail, puis, si la situation n'est pas régularisée, la saisine de la juridiction compétente afin d'obtenir le paiement des sommes dues, votre expulsion et la résiliation du bail dans les conditions prévues par la loi.
              </p>
              <p style={{ marginBottom:'0' }}>Je vous invite donc à régulariser votre situation sans délai afin d'éviter toute aggravation du dossier.</p>
            </>
          );

          const letterJSX = (
            <>
              <div style={{ marginBottom:'2.5rem' }}>
                <div style={{ fontWeight:700, fontSize:'13.5px' }}>{form.bailleur_nom}</div>
                <div>{form.bailleur_adresse}</div>
                <div>{form.bailleur_cp} {form.bailleur_ville}</div>
                {form.bailleur_email && <div style={{ fontSize:'11px', color:'#666' }}>{form.bailleur_email}</div>}
                {form.bailleur_tel && <div style={{ fontSize:'11px', color:'#666' }}>{form.bailleur_tel}</div>}
                {form.bailleur_siren && <div style={{ fontSize:'11px', color:'#666' }}>SIREN : {form.bailleur_siren}</div>}
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'2.5rem' }}>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontWeight:700, fontSize:'13.5px' }}>{form.locataire_nom}</div>
                  <div>{form.locataire_adresse}</div>
                  <div>{form.locataire_cp} {form.locataire_ville}</div>
                </div>
              </div>
              <div style={{ textAlign:'right', color:'#555', marginBottom:'2rem' }}>{form.bailleur_ville||'Ville'}, le {today}</div>
              <div style={{ marginBottom:'1.75rem', paddingBottom:'1rem', borderBottom:'1px solid #eee' }}>
                <div><strong>Objet :</strong> Mise en demeure de payer — loyer{form.loyers.length>1?'s':''} et/ou charges impayé{form.loyers.length>1?'s':''}</div>
              </div>
              <div style={{ filter: showFullLetter ? 'none' : 'blur(4px)', userSelect: showFullLetter ? 'text' : 'none', WebkitUserSelect: showFullLetter ? 'text' : 'none', transition:'filter 0.3s' }}>
                <div style={{ marginBottom:'1.5rem' }}>{gSalut(form.locataire_civilite, form.locataire_type)}</div>
                {bodyJSX}
                <div style={{ marginTop:'2rem' }}>
                  Dans l'attente d'une régularisation rapide de votre part, je vous prie d'agréer, {gAgree(form.locataire_civilite, form.locataire_type)}, l'expression de mes salutations distinguées.
                </div>
              </div>
              <div style={{ marginTop:'1.5rem', display:'inline-block' }}>
                {signature
                  ? <img src={signature} alt="signature" style={{ display:'block', width:'170px', height:'58px', objectFit:'contain', objectPosition:'left bottom', marginBottom:'2px' }} />
                  : <div style={{ height:'44px' }} />
                }
                <div style={{ fontWeight:700, fontSize:'13.5px' }}>{form.bailleur_nom}</div>
                {form.signataire_fonction && <div style={{ fontSize:'11px', color:'#666' }}>{form.signataire_fonction}</div>}
              </div>
            </>
          );

          const contentDivStyle = { width:A4W, padding:'0 80px', boxSizing:'border-box', fontFamily:"'DM Sans', sans-serif", fontSize:'13px', lineHeight:1.7, color:'#111', userSelect:'none', WebkitUserSelect:'none' };
          const ends   = [...breakPoints, letterH > 0 ? letterH : CONTENT_H];
          const slices = ends.map((end,i) => ({ start: i===0 ? 0 : ends[i-1], end })).filter(s => s.end > s.start);

          return (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem', flexWrap:'wrap', gap:'0.75rem' }}>
                <h1 style={{ fontFamily:F, fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:700, color:C.textDark, margin:0 }}>Votre lettre est prête</h1>
                <button type="button" onClick={() => setShowFullLetter(v => !v)} style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.5rem 1rem', borderRadius:'8px', border:`1.5px solid ${showFullLetter ? C.accent : C.borderLight}`, background: showFullLetter ? 'rgba(201,169,110,0.1)' : '#fff', fontFamily:F, fontWeight:600, fontSize:'0.8rem', color: showFullLetter ? C.accent : C.textMuted, cursor:'pointer', transition:'all 0.2s' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {showFullLetter ? 'Masquer le contenu' : 'Visualiser la lettre'}
                </button>
              </div>
              <p style={{ color:C.textMid, fontSize:'0.95rem', marginBottom:'2rem' }}>Relisez votre mise en demeure avant de l'envoyer.</p>

              {/* A4 preview */}
              <>
                <div ref={letterInnerRef} style={{ ...contentDivStyle, position:'fixed', top:'-9999px', left:'-9999px', visibility:'hidden', pointerEvents:'none' }}>
                  {letterJSX}
                </div>
                <div style={{ background:'#d8d8d4', padding:'1.25rem 1rem', marginBottom:'2rem', borderRadius:'12px', display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem' }}>
                  {(slices.length ? slices : [{ start:0, end:CONTENT_H }]).map(({ start, end }, pageIdx) => {
                    const sliceH = end - start;
                    const numPages = (slices.length || 1);
                    return (
                      <div key={pageIdx} style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'100%' }}>
                        {numPages > 1 && <div style={{ fontSize:'0.68rem', color:'#888', marginBottom:'0.35rem', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>Page {pageIdx+1} / {numPages}</div>}
                        <div style={{ width:A4W*scale, height:A4H*scale, background:'#fff', boxShadow:'0 4px 32px rgba(0,0,0,0.22)', flexShrink:0, overflow:'hidden', position:'relative' }}>
                          <div style={{ height:GUTTER*scale }} />
                          <div style={{ height:sliceH*scale, overflow:'hidden', position:'relative' }}>
                            <div style={{ ...contentDivStyle, position:'absolute', top:-(start*scale), left:0, transform:`scale(${scale})`, transformOrigin:'top left' }}>
                              {letterJSX}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>

              {/* Signature */}
              <div style={{ marginBottom:'1.5rem' }}>
                <p style={{ fontWeight:700, color:C.textDark, fontSize:'0.875rem', marginBottom:'0.75rem' }}>Votre signature <span style={{ fontWeight:400, color:'#999', fontSize:'0.78rem' }}>(optionnel)</span></p>
                <SignaturePad onChange={setSignature} />
                {signature && <p style={{ fontSize:'0.75rem', color:'#66a', marginTop:'0.4rem' }}>✓ Signature enregistrée</p>}
              </div>

              {/* Récap uploads */}
              {(uploadedFiles.bail.length + uploadedFiles.decompte.length + uploadedFiles.relances.length + uploadedFiles.autres.length) > 0 && (
                <div style={{ background:'#fff', border:`1.5px solid ${C.borderLight}`, borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                    <p style={{ fontWeight:700, color:C.textDark, fontSize:'0.95rem', margin:0 }}>Pièces jointes</p>
                    <button type="button" onClick={() => setStep(7)} style={{ fontSize:'0.78rem', color:C.accent, background:'none', border:'none', cursor:'pointer', fontFamily:F, fontWeight:600, textDecoration:'underline' }}>Modifier</button>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                    {[{key:'bail',label:'Contrat de bail'},{key:'decompte',label:'Décompte des loyers'},{key:'relances',label:'Preuves de relance'},{key:'autres',label:'Autres documents'}]
                      .filter(({key}) => uploadedFiles[key].length > 0)
                      .map(({key,label}) => (
                        <div key={key} style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.85rem', color:C.textMid }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                          <span style={{ color:C.textDark, fontWeight:600 }}>{label}</span>
                          <span style={{ color:'#999' }}>— {uploadedFiles[key].length} fichier{uploadedFiles[key].length>1?'s':''}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Récap */}
              <div style={{ background:'rgba(201,169,110,0.07)', border:`1px solid rgba(201,169,110,0.25)`, borderRadius:'10px', padding:'1rem 1.25rem', marginBottom:'2rem', fontSize:'0.85rem', color:C.textMid }}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem 2rem' }}>
                  <span>Envoi par <strong style={{ color:C.textDark }}>lettre recommandée AR</strong></span>
                  <span>Délai accordé : <strong style={{ color:C.textDark }}>{form.delai_paiement} jours</strong></span>
                  <span>Total réclamé : <strong style={{ color:C.textDark }}>{fmtEur(totalDu)} €</strong></span>
                </div>
              </div>

              {paymentError && <p style={{ color:'#c0392b', fontSize:'0.85rem', marginBottom:'1rem' }}>{paymentError}</p>}
              <button onClick={async () => {
                setPaymentLoading(true); setPaymentError('');
                try {
                  const res = await fetch('/api/create-checkout-session', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: form.bailleur_email, userId: user?.id || null,
                      letterData: { expediteurType: form.bailleur_type, expediteurNom: form.bailleur_nom, expediteurAdresse: form.bailleur_adresse, expediteurCP: form.bailleur_cp, expediteurVille: form.bailleur_ville, destinataireType: form.locataire_type, destinataireNom: form.locataire_nom, destinataireAdresse: form.locataire_adresse, destinataireCP: form.locataire_cp, destinataireVille: form.locataire_ville, litige: 'loyer', montant: totalDu.toFixed(2), delai: form.delai_paiement, description: `Loyer impayé — ${form.bien_adresse}` }
                    }),
                  });
                  const { url, error } = await res.json();
                  if (error) throw new Error(error);
                  window.location.href = url;
                } catch (e) { setPaymentError(e.message); }
                finally { setPaymentLoading(false); }
              }} style={{ width:'100%', background: paymentLoading ? '#999' : C.accent, border:'none', padding:'1.1rem 2rem', borderRadius:'10px', fontFamily:F, fontWeight:700, fontSize:'1.05rem', color:C.textDark, cursor: paymentLoading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem', boxShadow:'0 4px 24px rgba(201,169,110,0.3)', transition:'all 0.2s' }}>
                {paymentLoading ? 'Redirection vers le paiement…' : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>Envoyer ma lettre</>}
              </button>
              <p style={{ textAlign:'center', fontSize:'0.78rem', color:C.textMuted, marginTop:'0.75rem' }}>
                Paiement sécurisé · Envoi en LRAR via La Poste · Accusé de réception inclus
              </p>
            </div>
          );
        })()}

        {/* Navigation */}
        {step < 8 && (
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'2.5rem' }}>
            <button onClick={() => { if (canNext()) setStep(s => s+1); }} style={{ background: canNext() ? C.accent : '#E0E0DC', border:`2px solid ${canNext() ? C.accent : '#E0E0DC'}`, padding:'0.875rem 2rem', borderRadius:'8px', fontFamily:F, fontWeight:700, fontSize:'0.9rem', color: canNext() ? C.textDark : '#999', cursor: canNext() ? 'pointer' : 'not-allowed', transition:'all 0.2s' }}
              onMouseEnter={e => { if (canNext()) { e.currentTarget.style.background=C.accentHover; e.currentTarget.style.borderColor=C.accentHover; } }}
              onMouseLeave={e => { if (canNext()) { e.currentTarget.style.background=C.accent; e.currentTarget.style.borderColor=C.accent; } }}>
              {step === 7 ? 'Aperçu de ma lettre →' : 'Continuer →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Garant (Caution solidaire) ─────────────────────────────── */
const GarantImpayeForm = ({ onBack, user }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const TOTAL = 7;
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError]     = useState('');
  const [showFullLetter, setShowFullLetter] = useState(false);
  const [signature, setSignature]           = useState(null);
  const [letterH, setLetterH]               = useState(0);
  const [breakPoints, setBreakPoints]       = useState([]);
  const letterInnerRef = useRef(null);

  useEffect(() => {
    const el = letterInnerRef.current;
    if (!el) return;
    const h = el.offsetHeight;
    if (h === 0) return;
    const CONT_H = 1123 - 80 * 2;
    const containerTop = el.getBoundingClientRect().top;
    function findBreakY(parent, targetY) {
      let best = 0;
      for (const child of parent.children) {
        const r = child.getBoundingClientRect();
        const top = r.top - containerTop, bottom = r.bottom - containerTop;
        if (bottom <= targetY) { best = bottom; }
        else if (top < targetY) {
          const tag = child.tagName.toLowerCase();
          if (tag === 'div' && child.children.length > 0) {
            const inner = findBreakY(child, targetY);
            best = inner > best ? inner : (top > best ? top : best);
          } else { if (top > best) best = top; }
          break;
        } else break;
      }
      return best;
    }
    const newBreaks = [];
    let targetY = CONT_H;
    while (targetY < h) {
      let breakY = findBreakY(el, targetY);
      const prev = newBreaks[newBreaks.length - 1] ?? 0;
      if (breakY <= prev) breakY = targetY;
      newBreaks.push(breakY);
      targetY = breakY + CONT_H;
    }
    const same = h === letterH && newBreaks.join() === breakPoints.join();
    if (!same) { setLetterH(h); setBreakPoints(newBreaks); }
  });

  const newMois = () => ({ id: Date.now() + Math.random(), periode: '', loyer: '', charges: '0', paye: '0' });

  const [form, setForm] = useState({
    bailleur_type: '', bailleur_civilite: '', bailleur_nom: '', bailleur_adresse: '', bailleur_cp: '', bailleur_ville: '',
    bailleur_email: user?.email || '', bailleur_tel: '', bailleur_siren: '',
    garant_civilite: 'M.', garant_nom: '', garant_adresse: '', garant_cp: '', garant_ville: '',
    locataire_civilite: 'M.', locataire_nom: '',
    bien_adresse: '', caution_date: '',
    loyers: [newMois()],
    delai_paiement: '8',
    mode_paiement: 'virement', iban: '', bic: '', titulaire_compte: '', ordre_cheque: '', preciser_mode: '',
    contact_tel: '', contact_email: '',
  });
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const [uploadedFiles, setUploadedFiles] = useState({ caution: [], bail: [], decompte: [], autres: [] });
  const addFiles   = (key, files) => setUploadedFiles(p => ({ ...p, [key]: [...p[key], ...files] }));
  const removeFile = (key, idx)   => setUploadedFiles(p => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));

  const totalDu = form.loyers.reduce((sum, l) =>
    sum + Math.max(0, (parseFloat(l.loyer)||0) + (parseFloat(l.charges)||0) - (parseFloat(l.paye)||0)), 0);
  const fmtEur = n => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const inputStyle = {
    width: '100%', padding: '0.85rem 1rem', border: `1.5px solid ${C.borderLight}`, borderRadius: '8px',
    fontFamily: F, fontSize: '0.925rem', color: C.textDark, background: '#fff', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  const canNext = () => {
    if (step === 1) return !!(form.bailleur_type && form.bailleur_nom && form.bailleur_adresse && form.bailleur_cp && form.bailleur_ville && form.bailleur_email && form.bailleur_email.includes('@'));
    if (step === 2) return !!(form.garant_nom && form.garant_adresse && form.garant_cp && form.garant_ville);
    if (step === 3) return !!(form.locataire_nom && form.bien_adresse && form.caution_date);
    if (step === 4) return form.loyers.length > 0 && form.loyers.every(l => l.periode && l.loyer);
    if (step === 5) return !!(form.delai_paiement && form.mode_paiement && (form.mode_paiement !== 'virement' || (form.iban && form.titulaire_compte)));
    return true;
  };

  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: F }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.borderLight}`, padding: '1rem 0' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={step === 1 ? onBack : () => setStep(s => s - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.textMuted, fontFamily: F, fontSize: '0.875rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            {step === 1 ? 'Retour' : 'Précédent'}
          </button>
          <span style={{ fontSize: '0.8rem', color: C.textMuted, fontWeight: 600 }}>Étape {step} sur {TOTAL}</span>
        </div>
        <div style={{ maxWidth: '680px', margin: '0.75rem auto 0', padding: '0 1.5rem' }}>
          <div style={{ height: '3px', background: C.borderLight, borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step/TOTAL)*100}%`, background: C.accent, borderRadius: '99px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: isMobile ? '2rem 1.25rem' : '3rem 1.5rem' }}>

        {/* ── ÉTAPE 1 : Bailleur ── */}
        {step === 1 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Garant — Appel en caution</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Vos informations</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Vous êtes le bailleur qui engage la caution solidaire.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <FTypeBtn active={form.bailleur_type==='particulier'}   onClick={() => up('bailleur_type','particulier')}   label="Particulier"   sub="Propriétaire personne physique" />
                <FTypeBtn active={form.bailleur_type==='professionnel'} onClick={() => up('bailleur_type','professionnel')} label="Professionnel" sub="SCI, agence, société" />
              </div>
              {form.bailleur_type && (<>
                {form.bailleur_type==='particulier' && (
                  <FField label="Civilité">
                    <div style={{ display:'flex', gap:'0.75rem' }}>
                      {['M.','Mme'].map(c => <FTypeBtn key={c} active={form.bailleur_civilite===c} onClick={() => up('bailleur_civilite',c)} label={c} />)}
                    </div>
                  </FField>
                )}
                <FField label={form.bailleur_type==='professionnel' ? 'Raison sociale' : 'Nom complet'} required>
                  <input style={inputStyle} value={form.bailleur_nom} onChange={e => up('bailleur_nom', e.target.value)}
                    placeholder={form.bailleur_type==='professionnel' ? 'ex : Dupont Immobilier SARL' : 'ex : Marie Dupont'}
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
                <FField label="Adresse" required>
                  <input style={inputStyle} value={form.bailleur_adresse} onChange={e => up('bailleur_adresse', e.target.value)}
                    placeholder="ex : 12 rue de la Paix"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem' }}>
                  <FField label="Code postal" required>
                    <input style={inputStyle} value={form.bailleur_cp} onChange={e => up('bailleur_cp', e.target.value)} placeholder="75001"
                      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                  </FField>
                  <FField label="Ville" required>
                    <input style={inputStyle} value={form.bailleur_ville} onChange={e => up('bailleur_ville', e.target.value)} placeholder="Paris"
                      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                  </FField>
                </div>
                <FField label="Email" required>
                  <input style={inputStyle} type="email" value={form.bailleur_email} onChange={e => up('bailleur_email', e.target.value)}
                    placeholder="votre@email.com"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
                <FField label="Téléphone">
                  <input style={inputStyle} value={form.bailleur_tel} onChange={e => up('bailleur_tel', e.target.value)}
                    placeholder="06 00 00 00 00"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
                {form.bailleur_type==='professionnel' && (
                  <FField label="SIREN / SIRET">
                    <input style={inputStyle} value={form.bailleur_siren} onChange={e => up('bailleur_siren', e.target.value)}
                      placeholder="ex : 123 456 789"
                      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                  </FField>
                )}
              </>)}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : Garant ── */}
        {step === 2 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Destinataire</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Le garant (caution solidaire)</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>La personne qui s'est portée garante du locataire.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <FField label="Civilité">
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['M.','Mme'].map(c => (
                    <FTypeBtn key={c} active={form.garant_civilite===c} onClick={() => up('garant_civilite', c)} label={c} />
                  ))}
                </div>
              </FField>
              <FField label="Nom complet" required>
                <input style={inputStyle} value={form.garant_nom} onChange={e => up('garant_nom', e.target.value)}
                  placeholder="ex : Jean Martin"
                  onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
              </FField>
              <FField label="Adresse" required>
                <input style={inputStyle} value={form.garant_adresse} onChange={e => up('garant_adresse', e.target.value)}
                  placeholder="ex : 5 avenue Victor Hugo"
                  onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
              </FField>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem' }}>
                <FField label="Code postal" required>
                  <input style={inputStyle} value={form.garant_cp} onChange={e => up('garant_cp', e.target.value)} placeholder="75001"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
                <FField label="Ville" required>
                  <input style={inputStyle} value={form.garant_ville} onChange={e => up('garant_ville', e.target.value)} placeholder="Paris"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : Locataire & Bien ── */}
        {step === 3 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Locataire & bien loué</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Le locataire défaillant</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Ces informations permettent d'identifier le locataire dans la lettre.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <FField label="Civilité du locataire">
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['M.','Mme'].map(c => (
                    <FTypeBtn key={c} active={form.locataire_civilite===c} onClick={() => up('locataire_civilite', c)} label={c} />
                  ))}
                </div>
              </FField>
              <FField label="Nom complet du locataire" required>
                <input style={inputStyle} value={form.locataire_nom} onChange={e => up('locataire_nom', e.target.value)}
                  placeholder="ex : Sophie Leroy"
                  onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
              </FField>
              <FField label="Adresse du logement loué" required>
                <input style={inputStyle} value={form.bien_adresse} onChange={e => up('bien_adresse', e.target.value)}
                  placeholder="ex : 3 rue des Lilas, 75020 Paris"
                  onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
              </FField>
              <FField label="Date de signature de l'acte de cautionnement" required>
                <input style={inputStyle} type="date" value={form.caution_date} onChange={e => up('caution_date', e.target.value)}
                  onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
              </FField>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 4 : Impayés ── */}
        {step === 4 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Montants impayés</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Détail des impayés</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Renseignez chaque période de loyer impayé. Ces données formeront le tableau de la lettre.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {form.loyers.map((l, idx) => (
                <div key={l.id} style={{ background: '#fff', border: `1.5px solid ${C.borderLight}`, borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 700, color: C.textDark, fontSize: '0.9rem' }}>Période {idx+1}</span>
                    {form.loyers.length > 1 && (
                      <button type="button" onClick={() => up('loyers', form.loyers.filter(x => x.id !== l.id))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: '0.8rem', fontFamily: F }}>Supprimer</button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <FField label="Période concernée (ex : Janvier 2025)" required>
                      <input style={inputStyle} value={l.periode} onChange={e => up('loyers', form.loyers.map(x => x.id===l.id ? {...x, periode: e.target.value} : x))}
                        placeholder="ex : Janvier 2025"
                        onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                    </FField>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <FField label="Loyer dû (€)" required>
                        <input style={inputStyle} type="number" min="0" step="0.01" value={l.loyer} onChange={e => up('loyers', form.loyers.map(x => x.id===l.id ? {...x, loyer: e.target.value} : x))}
                          placeholder="800"
                          onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                      </FField>
                      <FField label="Charges (€)">
                        <input style={inputStyle} type="number" min="0" step="0.01" value={l.charges} onChange={e => up('loyers', form.loyers.map(x => x.id===l.id ? {...x, charges: e.target.value} : x))}
                          placeholder="50"
                          onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                      </FField>
                      <FField label="Déjà réglé (€)">
                        <input style={inputStyle} type="number" min="0" step="0.01" value={l.paye} onChange={e => up('loyers', form.loyers.map(x => x.id===l.id ? {...x, paye: e.target.value} : x))}
                          placeholder="0"
                          onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                      </FField>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => up('loyers', [...form.loyers, newMois()])}
                style={{ border: `1.5px dashed ${C.borderLight}`, borderRadius: '12px', padding: '0.875rem', background: 'none', cursor: 'pointer', fontFamily: F, color: C.textMuted, fontSize: '0.875rem', fontWeight: 600 }}>
                + Ajouter une période
              </button>
            </div>
            {totalDu > 0 && (
              <div style={{ marginTop: '1.5rem', background: 'rgba(201,169,110,0.08)', border: `1px solid rgba(201,169,110,0.3)`, borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: C.textDark, fontSize: '0.9rem' }}>Total impayé</span>
                <span style={{ fontWeight: 700, color: C.accent, fontSize: '1.1rem' }}>{fmtEur(totalDu)} €</span>
              </div>
            )}
          </div>
        )}

        {/* ── ÉTAPE 5 : Modalités ── */}
        {step === 5 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Modalités</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Délai et paiement</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Précisez le délai accordé et le mode de règlement souhaité.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <FField label="Délai accordé pour payer" required>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {['8','15','30'].map(d => (
                    <FTypeBtn key={d} active={form.delai_paiement===d} onClick={() => up('delai_paiement', d)} label={`${d} jours`} />
                  ))}
                </div>
              </FField>
              <FField label="Mode de paiement souhaité" required>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <FTypeBtn active={form.mode_paiement==='virement'} onClick={() => up('mode_paiement','virement')} label="Virement" />
                  <FTypeBtn active={form.mode_paiement==='cheque'}   onClick={() => up('mode_paiement','cheque')}   label="Chèque" />
                  <FTypeBtn active={form.mode_paiement==='autre'}    onClick={() => up('mode_paiement','autre')}    label="Autre" />
                </div>
              </FField>
              {form.mode_paiement==='virement' && (<>
                <FField label="Titulaire du compte" required>
                  <input style={inputStyle} value={form.titulaire_compte} onChange={e => up('titulaire_compte', e.target.value)}
                    placeholder="ex : Marie Dupont"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
                <FField label="IBAN" required>
                  <input style={inputStyle} value={form.iban} onChange={e => up('iban', e.target.value)}
                    placeholder="FR76 3000 6000 0112 3456 7890 189"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
                <FField label="BIC">
                  <input style={inputStyle} value={form.bic} onChange={e => up('bic', e.target.value)}
                    placeholder="BNPAFRPP"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
              </>)}
              {form.mode_paiement==='cheque' && (
                <FField label="Chèque à l'ordre de">
                  <input style={inputStyle} value={form.ordre_cheque} onChange={e => up('ordre_cheque', e.target.value)}
                    placeholder="ex : Marie Dupont"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
              )}
              {form.mode_paiement==='autre' && (
                <FField label="Préciser le mode de paiement">
                  <input style={inputStyle} value={form.preciser_mode} onChange={e => up('preciser_mode', e.target.value)}
                    placeholder="ex : espèces en main propre contre reçu"
                    onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                </FField>
              )}
              <div style={{ background: '#f7f7f5', borderRadius: '10px', padding: '1rem 1.25rem', marginTop: '0.5rem' }}>
                <p style={{ fontWeight: 600, color: C.textDark, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Contact pour règlement amiable (facultatif)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <FField label="Téléphone">
                    <input style={inputStyle} value={form.contact_tel} onChange={e => up('contact_tel', e.target.value)}
                      placeholder="06 00 00 00 00"
                      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                  </FField>
                  <FField label="Email">
                    <input style={inputStyle} type="email" value={form.contact_email} onChange={e => up('contact_email', e.target.value)}
                      placeholder="votre@email.com"
                      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.borderLight} />
                  </FField>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 6 : Pièces jointes ── */}
        {step === 6 && (
          <div>
            <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Documents</p>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>Pièces jointes</h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Joignez les documents qui appuient votre demande. Cette étape est facultative.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <FUploadZone label="Acte de cautionnement signé" hint="La caution signée par le garant"
                files={uploadedFiles.caution} onAdd={f => addFiles('caution', f)} onRemove={i => removeFile('caution', i)} />
              <FUploadZone label="Contrat de bail" hint="Le bail entre bailleur et locataire"
                files={uploadedFiles.bail} onAdd={f => addFiles('bail', f)} onRemove={i => removeFile('bail', i)} />
              <FUploadZone label="Décompte des loyers impayés" hint="Relevé ou état des impayés"
                files={uploadedFiles.decompte} onAdd={f => addFiles('decompte', f)} onRemove={i => removeFile('decompte', i)} />
              <FUploadZone label="Autres documents" hint="Tout justificatif complémentaire"
                files={uploadedFiles.autres} onAdd={f => addFiles('autres', f)} onRemove={i => removeFile('autres', i)} />
            </div>
          </div>
        )}

        {/* ── ÉTAPE 7 : Aperçu & Envoi ── */}
        {step === 7 && (() => {
          const A4W = 794, A4H = 1123, GUTTER = 80, CONTENT_H = A4H - GUTTER * 2;
          const scale = isMobile ? 0.42 : 0.68;
          const fmtDateFr = d => d ? new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}) : '—';

          const bodyJSX = (
            <>
              <p style={{ marginBottom:'1.25rem' }}>
                Je me permets de vous contacter en votre qualité de caution solidaire de <strong>{form.locataire_civilite} {form.locataire_nom||'—'}</strong>, locataire du logement situé à l'adresse suivante :
              </p>
              <p style={{ marginBottom:'1.25rem', paddingLeft:'1rem', borderLeft:'3px solid #e0e0e0', fontStyle:'italic' }}>
                {form.bien_adresse||'—'}
              </p>
              <p style={{ marginBottom:'1.25rem' }}>
                Conformément à l'acte de cautionnement solidaire que vous avez signé le <strong>{fmtDateFr(form.caution_date)}</strong>, vous vous êtes {gA(form.garant_civilite, 'particulier', 'engagé', 'engagée')} à garantir le paiement des loyers, charges et accessoires dus par le locataire en cas de défaillance de sa part.
              </p>
              <p style={{ marginBottom:'1.25rem' }}>
                Or, je vous informe que, malgré mes relances, le locataire n'a pas réglé les sommes qui lui incombent au titre de son contrat de bail.
              </p>
              <p style={{ marginBottom:'0.75rem' }}>
                À ce jour, les sommes impayées s'établissent de la manière suivante :
              </p>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11.5px', marginBottom:'1.25rem' }}>
                <thead>
                  <tr style={{ background:'#f2f2f2' }}>
                    {['Période','Loyer dû','Charges','Déjà réglé','Solde dû'].map(h => (
                      <th key={h} style={{ textAlign:h==='Période'?'left':'right', padding:'5px 8px', border:'1px solid #d8d8d8', fontWeight:700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {form.loyers.map(l => {
                    const solde = Math.max(0,(parseFloat(l.loyer)||0)+(parseFloat(l.charges)||0)-(parseFloat(l.paye)||0));
                    return (
                      <tr key={l.id}>
                        <td style={{ padding:'5px 8px', border:'1px solid #d8d8d8' }}>{l.periode||'—'}</td>
                        <td style={{ padding:'5px 8px', border:'1px solid #d8d8d8', textAlign:'right' }}>{l.loyer ? fmtEur(parseFloat(l.loyer))+' €' : '—'}</td>
                        <td style={{ padding:'5px 8px', border:'1px solid #d8d8d8', textAlign:'right' }}>{l.charges && parseFloat(l.charges)>0 ? fmtEur(parseFloat(l.charges))+' €' : '—'}</td>
                        <td style={{ padding:'5px 8px', border:'1px solid #d8d8d8', textAlign:'right' }}>{l.paye && parseFloat(l.paye)>0 ? fmtEur(parseFloat(l.paye))+' €' : '—'}</td>
                        <td style={{ padding:'5px 8px', border:'1px solid #d8d8d8', textAlign:'right', fontWeight:700 }}>{fmtEur(solde)} €</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background:'#f9f5ee' }}>
                    <td colSpan={4} style={{ padding:'5px 8px', border:'1px solid #d8d8d8', fontWeight:700, textAlign:'right' }}>Total dû</td>
                    <td style={{ padding:'5px 8px', border:'1px solid #d8d8d8', fontWeight:700, textAlign:'right' }}>{fmtEur(totalDu)} €</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ marginBottom:'1.25rem' }}>
                Le montant total restant dû au titre de l'occupation du logement s'élève ainsi à <strong>{fmtEur(totalDu)} €</strong>.
              </p>
              <p style={{ marginBottom:'1.25rem' }}>
                En votre qualité de caution solidaire et en l'absence de régularisation par le locataire, je vous mets donc formellement en demeure de procéder au règlement intégral de cette somme de <strong>{fmtEur(totalDu)} €</strong> dans un délai de <strong>{form.delai_paiement} jours</strong> à compter de la réception de ce courrier.
              </p>
              {form.mode_paiement==='virement' && (<>
                <p style={{ marginBottom:'0.6rem' }}>Le paiement devra être effectué par virement bancaire aux coordonnées suivantes :</p>
                {form.iban && (
                  <table style={{ borderCollapse:'collapse', fontSize:'11.5px', marginBottom:'1.25rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding:'5px 10px', border:'1px solid #d8d8d8', fontWeight:700, background:'#f2f2f2', whiteSpace:'nowrap' }}>Titulaire</td>
                        <td style={{ padding:'5px 10px', border:'1px solid #d8d8d8' }}>{form.titulaire_compte||'—'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding:'5px 10px', border:'1px solid #d8d8d8', fontWeight:700, background:'#f2f2f2' }}>IBAN</td>
                        <td style={{ padding:'5px 10px', border:'1px solid #d8d8d8', fontFamily:'monospace', letterSpacing:'0.04em' }}>{form.iban}</td>
                      </tr>
                      {form.bic && <tr>
                        <td style={{ padding:'5px 10px', border:'1px solid #d8d8d8', fontWeight:700, background:'#f2f2f2' }}>BIC</td>
                        <td style={{ padding:'5px 10px', border:'1px solid #d8d8d8' }}>{form.bic}</td>
                      </tr>}
                    </tbody>
                  </table>
                )}
              </>)}
              {form.mode_paiement==='cheque' && form.ordre_cheque && (
                <p style={{ marginBottom:'1.25rem' }}>Le paiement devra être effectué par chèque à l'ordre de : <strong>{form.ordre_cheque}</strong>.</p>
              )}
              {form.mode_paiement==='autre' && form.preciser_mode && (
                <p style={{ marginBottom:'1.25rem' }}>Le paiement devra être effectué par : {form.preciser_mode}.</p>
              )}
              <p style={{ marginBottom:'1.25rem' }}>
                À défaut de paiement intégral de votre part dans le délai imparti, je serai {gA(form.bailleur_civilite, form.bailleur_type, 'contraint', 'contrainte')} de transmettre ce dossier à un commissaire de justice pour la délivrance d'un commandement de payer. Si cette démarche n'aboutit pas, j'envisagerai la saisine de la juridiction compétente à votre encontre, conjointement avec le locataire, afin d'obtenir la condamnation solidaire au paiement des sommes dues.
              </p>
              {(form.contact_tel || form.contact_email) && (
                <p style={{ marginBottom:'1.25rem' }}>
                  Je reste toutefois à votre disposition si vous souhaitez me contacter{form.contact_tel ? ` au ${form.contact_tel}` : ''}{form.contact_tel && form.contact_email ? ' ou par email à ' : form.contact_email ? ' par email à ' : ''}{form.contact_email || ''} afin de trouver une issue amiable à cette situation.
                </p>
              )}
              <p style={{ marginBottom:'0' }}>
                Dans l'attente d'un prompt règlement, je vous prie d'agréer, {form.garant_civilite}, l'expression de mes salutations distinguées.
              </p>
            </>
          );

          const letterJSX = (
            <>
              <div style={{ marginBottom:'2.5rem' }}>
                <div style={{ fontWeight:700, fontSize:'13.5px' }}>{form.bailleur_nom}</div>
                <div>{form.bailleur_adresse}</div>
                <div>{form.bailleur_cp} {form.bailleur_ville}</div>
                {form.bailleur_email && <div style={{ fontSize:'11px', color:'#666' }}>{form.bailleur_email}</div>}
                {form.bailleur_tel && <div style={{ fontSize:'11px', color:'#666' }}>{form.bailleur_tel}</div>}
                {form.bailleur_siren && <div style={{ fontSize:'11px', color:'#666' }}>SIREN : {form.bailleur_siren}</div>}
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'2.5rem' }}>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontWeight:700, fontSize:'13.5px' }}>{form.garant_civilite} {form.garant_nom}</div>
                  <div>{form.garant_adresse}</div>
                  <div>{form.garant_cp} {form.garant_ville}</div>
                </div>
              </div>
              <div style={{ textAlign:'right', color:'#555', marginBottom:'2rem' }}>{form.bailleur_ville||'Ville'}, le {today}</div>
              <div style={{ marginBottom:'1.75rem', paddingBottom:'1rem', borderBottom:'1px solid #eee' }}>
                <div><strong>Objet :</strong> Mise en demeure de payer — Appel en garantie pour loyers et/ou charges impayés (Locataire : {form.locataire_civilite} {form.locataire_nom||'—'})</div>
              </div>
              <div style={{ filter: showFullLetter ? 'none' : 'blur(4px)', userSelect: showFullLetter ? 'text' : 'none', WebkitUserSelect: showFullLetter ? 'text' : 'none', transition:'filter 0.3s' }}>
                <div style={{ marginBottom:'1.5rem' }}>{form.garant_civilite},</div>
                {bodyJSX}
              </div>
              <div style={{ marginTop:'1.5rem', display:'inline-block' }}>
                {signature
                  ? <img src={signature} alt="signature" style={{ display:'block', width:'170px', height:'58px', objectFit:'contain', objectPosition:'left bottom', marginBottom:'2px' }} />
                  : <div style={{ height:'44px' }} />
                }
                <div style={{ fontWeight:700, fontSize:'13.5px' }}>{form.bailleur_nom}</div>
              </div>
            </>
          );

          const contentDivStyle = { width:A4W, padding:'0 80px', boxSizing:'border-box', fontFamily:"'DM Sans', sans-serif", fontSize:'13px', lineHeight:1.7, color:'#111', userSelect:'none', WebkitUserSelect:'none' };
          const ends   = [...breakPoints, letterH > 0 ? letterH : CONTENT_H];
          const slices = ends.map((end,i) => ({ start: i===0 ? 0 : ends[i-1], end })).filter(s => s.end > s.start);

          return (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem', flexWrap:'wrap', gap:'0.75rem' }}>
                <h1 style={{ fontFamily:F, fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:700, color:C.textDark, margin:0 }}>Votre lettre est prête</h1>
                <button type="button" onClick={() => setShowFullLetter(v => !v)} style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.5rem 1rem', borderRadius:'8px', border:`1.5px solid ${showFullLetter ? C.accent : C.borderLight}`, background: showFullLetter ? 'rgba(201,169,110,0.1)' : '#fff', fontFamily:F, fontWeight:600, fontSize:'0.8rem', color: showFullLetter ? C.accent : C.textMuted, cursor:'pointer', transition:'all 0.2s' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {showFullLetter ? 'Masquer le contenu' : 'Visualiser la lettre'}
                </button>
              </div>
              <p style={{ color:C.textMid, fontSize:'0.95rem', marginBottom:'2rem' }}>Relisez votre mise en demeure avant de l'envoyer.</p>

              {/* A4 preview */}
              <>
                <div ref={letterInnerRef} style={{ ...contentDivStyle, position:'fixed', top:'-9999px', left:'-9999px', visibility:'hidden', pointerEvents:'none' }}>
                  {letterJSX}
                </div>
                <div style={{ background:'#d8d8d4', padding:'1.25rem 1rem', marginBottom:'2rem', borderRadius:'12px', display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem' }}>
                  {(slices.length ? slices : [{ start:0, end:CONTENT_H }]).map(({ start, end }, pageIdx) => {
                    const sliceH = end - start;
                    const numPages = (slices.length || 1);
                    return (
                      <div key={pageIdx} style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'100%' }}>
                        {numPages > 1 && <div style={{ fontSize:'0.68rem', color:'#888', marginBottom:'0.35rem', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>Page {pageIdx+1} / {numPages}</div>}
                        <div style={{ width:A4W*scale, height:A4H*scale, background:'#fff', boxShadow:'0 4px 32px rgba(0,0,0,0.22)', flexShrink:0, overflow:'hidden', position:'relative' }}>
                          <div style={{ height:GUTTER*scale }} />
                          <div style={{ height:sliceH*scale, overflow:'hidden', position:'relative' }}>
                            <div style={{ ...contentDivStyle, position:'absolute', top:-(start*scale), left:0, transform:`scale(${scale})`, transformOrigin:'top left' }}>
                              {letterJSX}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>

              {/* Signature */}
              <div style={{ marginBottom:'1.5rem' }}>
                <p style={{ fontWeight:700, color:C.textDark, fontSize:'0.875rem', marginBottom:'0.75rem' }}>Votre signature <span style={{ fontWeight:400, color:'#999', fontSize:'0.78rem' }}>(optionnel)</span></p>
                <SignaturePad onChange={setSignature} />
                {signature && <p style={{ fontSize:'0.75rem', color:'#66a', marginTop:'0.4rem' }}>✓ Signature enregistrée</p>}
              </div>

              {/* Récap uploads */}
              {(uploadedFiles.caution.length + uploadedFiles.bail.length + uploadedFiles.decompte.length + uploadedFiles.autres.length) > 0 && (
                <div style={{ background:'#fff', border:`1.5px solid ${C.borderLight}`, borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                    <p style={{ fontWeight:700, color:C.textDark, fontSize:'0.95rem', margin:0 }}>Pièces jointes</p>
                    <button type="button" onClick={() => setStep(6)} style={{ fontSize:'0.78rem', color:C.accent, background:'none', border:'none', cursor:'pointer', fontFamily:F, fontWeight:600, textDecoration:'underline' }}>Modifier</button>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                    {[{key:'caution',label:'Acte de cautionnement'},{key:'bail',label:'Contrat de bail'},{key:'decompte',label:'Décompte des impayés'},{key:'autres',label:'Autres documents'}]
                      .filter(({key}) => uploadedFiles[key].length > 0)
                      .map(({key,label}) => (
                        <div key={key} style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.85rem', color:C.textMid }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                          <span style={{ color:C.textDark, fontWeight:600 }}>{label}</span>
                          <span style={{ color:'#999' }}>— {uploadedFiles[key].length} fichier{uploadedFiles[key].length>1?'s':''}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Récap */}
              <div style={{ background:'rgba(201,169,110,0.07)', border:`1px solid rgba(201,169,110,0.25)`, borderRadius:'10px', padding:'1rem 1.25rem', marginBottom:'2rem', fontSize:'0.85rem', color:C.textMid }}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem 2rem' }}>
                  <span>Envoi par <strong style={{ color:C.textDark }}>lettre recommandée AR</strong></span>
                  <span>Délai accordé : <strong style={{ color:C.textDark }}>{form.delai_paiement} jours</strong></span>
                  <span>Total réclamé : <strong style={{ color:C.textDark }}>{fmtEur(totalDu)} €</strong></span>
                </div>
              </div>

              {paymentError && <p style={{ color:'#c0392b', fontSize:'0.85rem', marginBottom:'1rem' }}>{paymentError}</p>}
              <button onClick={async () => {
                setPaymentLoading(true); setPaymentError('');
                try {
                  const res = await fetch('/api/create-checkout-session', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: form.bailleur_email, userId: user?.id || null,
                      letterData: { expediteurType: form.bailleur_type, expediteurNom: form.bailleur_nom, expediteurAdresse: form.bailleur_adresse, expediteurCP: form.bailleur_cp, expediteurVille: form.bailleur_ville, destinataireType: 'particulier', destinataireNom: `${form.garant_civilite} ${form.garant_nom}`, destinataireAdresse: form.garant_adresse, destinataireCP: form.garant_cp, destinataireVille: form.garant_ville, litige: 'loyer', montant: totalDu.toFixed(2), delai: form.delai_paiement, description: `Appel en garantie — Locataire : ${form.locataire_nom}` }
                    }),
                  });
                  const { url, error } = await res.json();
                  if (error) throw new Error(error);
                  window.location.href = url;
                } catch (e) { setPaymentError(e.message); }
                finally { setPaymentLoading(false); }
              }} style={{ width:'100%', background: paymentLoading ? '#999' : C.accent, border:'none', padding:'1.1rem 2rem', borderRadius:'10px', fontFamily:F, fontWeight:700, fontSize:'1.05rem', color:C.textDark, cursor: paymentLoading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem', boxShadow:'0 4px 24px rgba(201,169,110,0.3)', transition:'all 0.2s' }}>
                {paymentLoading ? 'Redirection vers le paiement…' : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>Envoyer ma lettre</>}
              </button>
              <p style={{ textAlign:'center', fontSize:'0.78rem', color:C.textMuted, marginTop:'0.75rem' }}>
                Paiement sécurisé · Envoi en LRAR via La Poste · Accusé de réception inclus
              </p>
            </div>
          );
        })()}

        {/* Navigation */}
        {step < 7 && (
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'2.5rem' }}>
            <button onClick={() => { if (canNext()) setStep(s => s+1); }} style={{ background: canNext() ? C.accent : '#E0E0DC', border:`2px solid ${canNext() ? C.accent : '#E0E0DC'}`, padding:'0.875rem 2rem', borderRadius:'8px', fontFamily:F, fontWeight:700, fontSize:'0.9rem', color: canNext() ? C.textDark : '#999', cursor: canNext() ? 'pointer' : 'not-allowed', transition:'all 0.2s' }}
              onMouseEnter={e => { if (canNext()) { e.currentTarget.style.background=C.accentHover; e.currentTarget.style.borderColor=C.accentHover; } }}
              onMouseLeave={e => { if (canNext()) { e.currentTarget.style.background=C.accent; e.currentTarget.style.borderColor=C.accent; } }}>
              {step === 6 ? 'Aperçu de ma lettre →' : 'Continuer →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Form multi-étapes ──────────────────────────────────────── */
const FormPage = ({ onBack, user }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [showFactureForm, setShowFactureForm] = useState(false);
  const [showLoyerForm,   setShowLoyerForm]   = useState(false);
  const [showGarantForm,    setShowGarantForm]    = useState(false);
  const [showLoyerChoice,   setShowLoyerChoice]   = useState(false);
  const [loyerDestinataire, setLoyerDestinataire] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError]     = useState('');
  const [data, setData] = useState({
    litige: '',
    expediteurType: '',
    expediteurNom: '',
    expediteurAdresse: '',
    expediteurCP: '',
    expediteurVille: '',
    destinataireType: '',
    destinataireNom: '',
    destinataireAdresse: '',
    destinataireCP: '',
    destinataireVille: '',
    montant: '',
    dateFait: '',
    delai: '15',
    description: '',
    email: user?.email || '',
  });

  const update = (k, v) => setData(d => ({ ...d, [k]: v }));
  const TOTAL = 5;

  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const getObjet = () => ({
    facture:       'Mise en demeure de paiement — facture impayée',
    loyer:         'Mise en demeure de paiement — loyer(s) impayé(s)',
    caution:       'Mise en demeure de restitution du dépôt de garantie',
    travaux:       'Mise en demeure — malfaçons et non-conformité des travaux',
    remboursement: 'Mise en demeure de remboursement',
    autre:         'Mise en demeure',
  }[data.litige] || 'Mise en demeure');

  const getCorps = () => {
    const nom = data.destinataireNom;
    const montant = data.montant ? `${Number(data.montant).toLocaleString('fr-FR')} €` : '[montant]';
    const dateFmt = data.dateFait ? new Date(data.dateFait).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '[date]';
    const desc = data.description ? ` En effet, ${data.description.charAt(0).toLowerCase() + data.description.slice(1).replace(/\.$/, '')}.` : '';
    const action = {
      facture:       `procéder au règlement intégral de la somme de ${montant} correspondant aux factures impayées à ce jour`,
      loyer:         `procéder au règlement de l'intégralité des loyers et charges impayés, soit la somme de ${montant}`,
      caution:       `me restituer le dépôt de garantie d'un montant de ${montant} conformément à l'article 22 de la loi du 6 juillet 1989`,
      travaux:       `remédier dans les meilleurs délais aux malfaçons et non-conformités constatées dans les travaux réalisés${montant !== '[montant]' ? `, ou me rembourser la somme de ${montant}` : ''}`,
      remboursement: `procéder au remboursement de la somme de ${montant}`,
      autre:         `donner suite à ma réclamation portant sur la somme de ${montant}`,
    }[data.litige] || `régler la somme de ${montant}`;

    return `Malgré mes demandes restées sans suite satisfaisante, vous n'avez pas${data.litige === 'caution' ? ' restitué mon dépôt de garantie' : data.litige === 'travaux' ? ' remédié aux problèmes signalés' : ' honoré vos obligations'} à ce jour.${desc}

Par la présente, et conformément aux articles 1344 et suivants du Code civil, je vous mets en demeure de ${action} dans un délai de ${data.delai} jours à compter de la réception du présent courrier.

Passé ce délai sans réponse satisfaisante de votre part, je me verrai contraint(e) de saisir les juridictions compétentes afin de faire valoir mes droits, les frais de procédure et intérêts moratoires restant à votre charge.

La présente lettre, envoyée en recommandé avec accusé de réception, constitue une mise en demeure formelle au sens de l'article 1344 du Code civil.`;
  };

  const LITIGES = [
    { id: 'facture',       label: 'Facture impayée',          desc: 'Un client ou prestataire ne vous a pas payé' },
    { id: 'loyer',         label: 'Loyer ou charges impayés', desc: 'Un locataire ne règle pas son loyer' },
    { id: 'caution',       label: 'Caution non restituée',    desc: 'Votre propriétaire garde votre dépôt de garantie' },
    { id: 'travaux',       label: 'Travaux mal réalisés',     desc: 'Un artisan n\'a pas respecté sa prestation' },
    { id: 'remboursement', label: 'Remboursement refusé',     desc: 'Un vendeur refuse de vous rembourser' },
    { id: 'autre',         label: 'Autre situation',          desc: 'Un litige non listé ci-dessus' },
  ];

  const inputStyle = {
    width: '100%', padding: '0.85rem 1rem',
    border: `1.5px solid ${C.borderLight}`, borderRadius: '8px',
    fontFamily: F, fontSize: '0.925rem', color: C.textDark,
    background: '#fff', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const TypeBtn = ({ value, field, label, sub }) => {
    const active = data[field] === value;
    return (
      <button type="button" onClick={() => update(field, value)} style={{
        flex: 1, padding: '1rem', borderRadius: '10px', cursor: 'pointer',
        border: `2px solid ${active ? C.accent : C.borderLight}`,
        background: active ? 'rgba(201,169,110,0.07)' : '#fff',
        fontFamily: F, textAlign: 'center', transition: 'all 0.15s',
      }}>
        <div style={{ fontWeight: 700, color: active ? C.accent : C.textDark, fontSize: '0.95rem' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: C.textMuted, marginTop: '0.25rem' }}>{sub}</div>}
      </button>
    );
  };

  const canNext = () => {
    if (step === 1) return !!data.litige;
    if (step === 2) return data.expediteurType && data.expediteurNom && data.expediteurAdresse && data.expediteurCP && data.expediteurVille;
    if (step === 3) return data.destinataireType && data.destinataireNom && data.destinataireAdresse && data.destinataireCP && data.destinataireVille;
    if (step === 4) return !!(data.email && data.email.includes('@'));
    return true;
  };

  if (showFactureForm) return <FactureImpayeeForm onBack={() => setShowFactureForm(false)} user={user} />;
  if (showLoyerForm)   return <LoyerImpayeForm   onBack={() => setShowLoyerForm(false)}   user={user} />;
  if (showGarantForm)  return <GarantImpayeForm  onBack={() => setShowGarantForm(false)}  user={user} />;

  if (showLoyerChoice) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: F }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.borderLight}`, padding: '1rem 0' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => { setShowLoyerChoice(false); setLoyerDestinataire(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.textMuted, fontFamily: F, fontSize: '0.875rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Précédent
          </button>
          <span style={{ fontSize: '0.8rem', color: C.textMuted, fontWeight: 600 }}>Loyer impayé</span>
        </div>
      </div>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: isMobile ? '2rem 1.25rem' : '3rem 1.5rem' }}>
        <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Loyer impayé</p>
        <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>À qui adresser la lettre ?</h1>
        <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>Choisissez le destinataire de votre mise en demeure.</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem', marginBottom: '2.5rem' }}>
          {[
            { id: 'locataire', label: 'Au locataire', desc: 'Mise en demeure directement adressée au locataire en défaut de paiement' },
            { id: 'garant',    label: 'Au garant (caution solidaire)', desc: 'Appel en garantie adressé à la personne qui s\'est portée caution pour le locataire' },
          ].map(opt => {
            const active = loyerDestinataire === opt.id;
            return (
              <button key={opt.id} type="button" onClick={() => setLoyerDestinataire(opt.id)} style={{
                padding: '1.5rem 1.25rem', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                border: `2px solid ${active ? C.accent : C.borderLight}`,
                background: active ? 'rgba(201,169,110,0.07)' : '#fff',
                fontFamily: F, transition: 'all 0.15s',
                boxShadow: active ? `0 0 0 3px rgba(201,169,110,0.15)` : 'none',
              }}>
                <div style={{ fontWeight: 700, color: active ? C.accent : C.textDark, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{opt.label}</div>
                <div style={{ fontSize: '0.8rem', color: C.textMuted, lineHeight: 1.4 }}>{opt.desc}</div>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button disabled={!loyerDestinataire} onClick={() => {
            if (loyerDestinataire === 'garant')    { setShowGarantForm(true);  setShowLoyerChoice(false); }
            if (loyerDestinataire === 'locataire') { setShowLoyerForm(true);   setShowLoyerChoice(false); }
          }} style={{
            background: loyerDestinataire ? C.accent : '#E0E0DC', border: `2px solid ${loyerDestinataire ? C.accent : '#E0E0DC'}`,
            padding: '0.875rem 2rem', borderRadius: '8px', fontFamily: F, fontWeight: 700,
            fontSize: '0.9rem', color: loyerDestinataire ? C.textDark : '#999',
            cursor: loyerDestinataire ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
          }}>
            Continuer →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: F }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.borderLight}`, padding: '1rem 0' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.textMuted, fontFamily: F, fontSize: '0.875rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Retour
          </button>
          <span style={{ fontSize: '0.8rem', color: C.textMuted, fontWeight: 600 }}>Étape {step} sur {TOTAL}</span>
        </div>
        {/* Barre de progression */}
        <div style={{ maxWidth: '680px', margin: '0.75rem auto 0', padding: '0 1.5rem' }}>
          <div style={{ height: '3px', background: C.borderLight, borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / TOTAL) * 100}%`, background: C.accent, borderRadius: '99px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: isMobile ? '2rem 1.25rem' : '3rem 1.5rem' }}>

        {/* ── ÉTAPE 1 : Type de litige ── */}
        {step === 1 && (
          <div>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>
              Quel est votre problème ?
            </h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>
              Choisissez la situation qui correspond le mieux à votre cas.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem', marginBottom: '2rem' }}>
              {LITIGES.map(l => {
                const active = data.litige === l.id;
                return (
                  <button key={l.id} type="button" onClick={() => { update('litige', l.id); if (l.id !== 'loyer') setLoyerDestinataire(''); }} style={{
                    padding: '1.25rem 1.25rem', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${active ? C.accent : C.borderLight}`,
                    background: active ? 'rgba(201,169,110,0.07)' : '#fff',
                    fontFamily: F, transition: 'all 0.15s',
                    boxShadow: active ? `0 0 0 3px rgba(201,169,110,0.15)` : 'none',
                  }}>
                    <div style={{ fontWeight: 700, color: active ? C.accent : C.textDark, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{l.label}</div>
                    <div style={{ fontSize: '0.8rem', color: C.textMuted, lineHeight: 1.4 }}>{l.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : Vous ── */}
        {step === 2 && (
          <div>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>
              Qui êtes-vous ?
            </h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>
              Ces informations apparaîtront en tant qu'expéditeur sur votre lettre.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <TypeBtn value="particulier"   field="expediteurType" label="Particulier"   sub="Une personne" />
              <TypeBtn value="professionnel" field="expediteurType" label="Professionnel" sub="Une entreprise" />
            </div>
            {data.expediteurType && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>
                    {data.expediteurType === 'professionnel' ? 'Nom de l\'entreprise' : 'Votre nom complet'}
                  </label>
                  <input style={inputStyle} value={data.expediteurNom} onChange={e => update('expediteurNom', e.target.value)}
                    placeholder={data.expediteurType === 'professionnel' ? 'ex : Dupont SARL' : 'ex : Marie Dupont'}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.borderLight} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Adresse</label>
                  <input style={inputStyle} value={data.expediteurAdresse} onChange={e => update('expediteurAdresse', e.target.value)}
                    placeholder="ex : 12 rue de la Paix"
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.borderLight} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Code postal</label>
                    <input style={inputStyle} value={data.expediteurCP} onChange={e => update('expediteurCP', e.target.value)}
                      placeholder="75001"
                      onFocus={e => e.target.style.borderColor = C.accent}
                      onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Ville</label>
                    <input style={inputStyle} value={data.expediteurVille} onChange={e => update('expediteurVille', e.target.value)}
                      placeholder="Paris"
                      onFocus={e => e.target.style.borderColor = C.accent}
                      onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ÉTAPE 3 : Destinataire ── */}
        {step === 3 && (
          <div>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>
              À qui vous adressez-vous ?
            </h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>
              La personne ou l'entreprise qui recevra votre lettre recommandée.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <TypeBtn value="particulier"   field="destinataireType" label="Un particulier"   sub="Une personne" />
              <TypeBtn value="professionnel" field="destinataireType" label="Un professionnel" sub="Une entreprise" />
            </div>
            {data.destinataireType && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>
                    {data.destinataireType === 'professionnel' ? 'Nom de l\'entreprise' : 'Nom complet'}
                  </label>
                  <input style={inputStyle} value={data.destinataireNom} onChange={e => update('destinataireNom', e.target.value)}
                    placeholder={data.destinataireType === 'professionnel' ? 'ex : Martin Immobilier' : 'ex : Jean Martin'}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.borderLight} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Adresse</label>
                  <input style={inputStyle} value={data.destinataireAdresse} onChange={e => update('destinataireAdresse', e.target.value)}
                    placeholder="ex : 5 avenue Victor Hugo"
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.borderLight} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Code postal</label>
                    <input style={inputStyle} value={data.destinataireCP} onChange={e => update('destinataireCP', e.target.value)}
                      placeholder="69001"
                      onFocus={e => e.target.style.borderColor = C.accent}
                      onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Ville</label>
                    <input style={inputStyle} value={data.destinataireVille} onChange={e => update('destinataireVille', e.target.value)}
                      placeholder="Lyon"
                      onFocus={e => e.target.style.borderColor = C.accent}
                      onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ÉTAPE 4 : Détails ── */}
        {step === 4 && (
          <div>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>
              Les détails de votre litige
            </h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>
              Ces informations serviront à rédiger votre lettre automatiquement.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>
                  Montant réclamé (€)
                </label>
                <input style={inputStyle} type="number" value={data.montant} onChange={e => update('montant', e.target.value)}
                  placeholder="ex : 1 200"
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.borderLight} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>
                  Depuis quand ? (date approximative)
                </label>
                <input style={inputStyle} type="date" value={data.dateFait} onChange={e => update('dateFait', e.target.value)}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.borderLight} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>
                  Délai accordé pour régler le problème
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['8', '15', '30'].map(j => (
                    <button key={j} type="button" onClick={() => update('delai', j)} style={{
                      flex: 1, padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
                      border: `2px solid ${data.delai === j ? C.accent : C.borderLight}`,
                      background: data.delai === j ? 'rgba(201,169,110,0.07)' : '#fff',
                      fontFamily: F, fontWeight: 700, color: data.delai === j ? C.accent : C.textDark,
                      fontSize: '0.9rem', transition: 'all 0.15s',
                    }}>
                      {j} jours
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>
                  Expliquez brièvement la situation <span style={{ color: C.textMuted, fontWeight: 400 }}>(optionnel)</span>
                </label>
                <textarea style={{ ...inputStyle, minHeight: '110px', resize: 'vertical' }} value={data.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="ex : J'ai effectué une prestation le 10 mars, la facture n°2025-42 est restée impayée malgré mes relances..."
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.borderLight} />
              </div>

              {/* Email pour recevoir le suivi */}
              <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: '1.25rem', marginTop: '0.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>
                  Votre adresse e-mail <span style={{ color: '#EF4444' }}>*</span>
                  <span style={{ fontWeight: 400, color: C.textMuted, marginLeft: '0.4rem' }}>— pour recevoir votre numéro de suivi</span>
                </label>
                <input style={inputStyle} type="email" value={data.email || ''}
                  onChange={e => update('email', e.target.value)}
                  placeholder="vous@example.com"
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.borderLight} />
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 5 : Aperçu de la lettre ── */}
        {step === 5 && (
          <div>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>
              Votre lettre est prête
            </h1>
            <p style={{ color: C.textMid, fontSize: '0.95rem', marginBottom: '2rem' }}>
              Relisez votre mise en demeure avant de l'envoyer.
            </p>

            {/* Lettre format A4 — vrai A4 réduit pour l'aperçu */}
            {(() => {
              const A4W = 794, A4H = 1123;
              const scale = isMobile ? 0.42 : 0.68;
              return (
              <div style={{ background: '#e8e8e4', padding: '1.5rem', marginBottom: '2rem', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: A4W * scale, height: A4H * scale, position: 'relative', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', flexShrink: 0 }}>
                  <div style={{
                    background: '#fff',
                    width: A4W, height: A4H,
                    position: 'absolute', top: 0, left: 0,
                    transform: `scale(${scale})`, transformOrigin: 'top left',
                    padding: '96px 90px 96px 96px',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '13px', lineHeight: 1.75,
                    color: '#111', boxSizing: 'border-box',
                    userSelect: 'none', WebkitUserSelect: 'none',
                  }}>
              {/* Bloc expéditeur — gauche */}
              <div style={{ marginBottom: '3rem' }}>
                <div style={{ fontWeight: 700 }}>{data.expediteurNom}</div>
                <div>{data.expediteurAdresse}</div>
                <div>{data.expediteurCP} {data.expediteurVille}</div>
              </div>

              {/* Bloc destinataire — droite (norme française) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>{data.destinataireNom}</div>
                  <div>{data.destinataireAdresse}</div>
                  <div>{data.destinataireCP} {data.destinataireVille}</div>
                </div>
              </div>

              {/* Lieu et date — droite */}
              <div style={{ textAlign: 'right', color: '#555', marginBottom: '2.5rem' }}>
                {data.expediteurVille || 'Ville'}, le {today}
              </div>

              {/* Objet */}
              <div style={{ marginBottom: '2rem' }}>
                <div><strong>Objet :</strong> {getObjet()}</div>
                <div style={{ color: '#666', fontSize: '0.85rem' }}>Lettre recommandée avec accusé de réception</div>
              </div>

              {/* Contenu flouté — après l'objet */}
              <div style={{ filter: 'blur(4px)', userSelect: 'none', WebkitUserSelect: 'none' }}>
                {/* Formule d'appel */}
                <div style={{ marginBottom: '1.5rem' }}>Madame, Monsieur,</div>

                {/* Corps */}
                {getCorps().split('\n\n').map((para, i) => (
                  <p key={i} style={{ marginBottom: '1.25rem' }}>{para}</p>
                ))}

                {/* Formule de politesse */}
                <div style={{ marginTop: '2rem', marginBottom: '3rem' }}>
                  Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.
                </div>
              </div>

              {/* Signature */}
              <div style={{ fontWeight: 700 }}>{data.expediteurNom}</div>
            </div>
            </div>
            </div>
              );
            })()}

            {/* Récap infos */}
            <div style={{ background: 'rgba(201,169,110,0.07)', border: `1px solid rgba(201,169,110,0.25)`, borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '2rem', fontSize: '0.85rem', color: C.textMid }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 2rem' }}>
                <span>Envoi par <strong style={{ color: C.textDark }}>lettre recommandée AR</strong></span>
                <span>Délai accordé : <strong style={{ color: C.textDark }}>{data.delai} jours</strong></span>
                {data.montant && <span>Montant : <strong style={{ color: C.textDark }}>{Number(data.montant).toLocaleString('fr-FR')} €</strong></span>}
              </div>
            </div>

            {/* CTA paiement */}
            {paymentError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#DC2626' }}>
                {paymentError}
              </div>
            )}
            <button
              disabled={paymentLoading}
              onClick={async () => {
                setPaymentLoading(true); setPaymentError('');
                try {
                  const res = await fetch('/api/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ letterData: data, email: data.email, userId: user?.id || null }),
                  });
                  const json = await res.json();
                  if (json.error) throw new Error(json.error);
                  if (!json.url) throw new Error(`Réponse inattendue (status ${res.status})`);
                  window.location.href = json.url;
                } catch (err) {
                  setPaymentError(err.message || 'Une erreur est survenue. Réessayez.');
                  setPaymentLoading(false);
                }
              }}
              style={{
                width: '100%', background: paymentLoading ? '#999' : C.accent, border: 'none',
                padding: '1.1rem 2rem', borderRadius: '10px', fontFamily: F, fontWeight: 700,
                fontSize: '1.05rem', color: C.textDark, cursor: paymentLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                boxShadow: '0 4px 24px rgba(201,169,110,0.3)', transition: 'all 0.2s',
              }}>
              {paymentLoading
                ? 'Redirection vers le paiement…'
                : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>Envoyer ma lettre</>
              }
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: C.textMuted, marginTop: '0.75rem' }}>
              Paiement sécurisé · Envoi en LRAR via La Poste · Accusé de réception inclus
            </p>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: step > 1 ? 'space-between' : 'flex-end', marginTop: step === 5 ? '0' : '2.5rem', gap: '1rem' }}>
          {step > 1 && step < 5 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              background: 'none', border: `2px solid ${C.borderLight}`, padding: '0.875rem 1.75rem',
              borderRadius: '8px', fontFamily: F, fontWeight: 700, fontSize: '0.9rem',
              color: C.textMid, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.color = C.textMid; }}>
              ← Précédent
            </button>
          )}
          {step < 4 && (
            <button onClick={() => {
              if (!canNext()) return;
              if (step === 1 && data.litige === 'facture') { setShowFactureForm(true); return; }
              if (step === 1 && data.litige === 'loyer')   { setShowLoyerChoice(true); return; }
              setStep(s => s + 1);
            }} style={{
              background: canNext() ? C.accent : '#E0E0DC', border: `2px solid ${canNext() ? C.accent : '#E0E0DC'}`,
              padding: '0.875rem 2rem', borderRadius: '8px', fontFamily: F, fontWeight: 700,
              fontSize: '0.9rem', color: canNext() ? C.textDark : '#999',
              cursor: canNext() ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (canNext()) { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.borderColor = C.accentHover; } }}
            onMouseLeave={e => { if (canNext()) { e.currentTarget.style.background = C.accent; e.currentTarget.style.borderColor = C.accent; } }}>
              Continuer →
            </button>
          )}
          {step === 4 && (
            <button onClick={() => setStep(5)} style={{
              background: C.accent, border: `2px solid ${C.accent}`,
              padding: '0.875rem 2rem', borderRadius: '8px', fontFamily: F, fontWeight: 700,
              fontSize: '0.9rem', color: C.textDark, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(201,169,110,0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.borderColor = C.accentHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.borderColor = C.accent; }}>
              Générer ma lettre →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Page Contact ───────────────────────────────────────────── */
const ContactPage = ({ onBack }) => {
  const isMobile = useIsMobile();
  const [form, setForm]       = useState({ nom: '', email: '', sujet: '', message: '' });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch('https://formspree.io/f/xpwzgqdb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(form),
    });
    setSent(true);
    setLoading(false);
  };

  const inputStyle = { width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1.5px solid #E8E6E1', fontFamily: F, fontSize: '0.95rem', color: '#1A1A2E', background: '#FAFAF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, background 0.2s' };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: F }}>
      <AuthTopBar onBack={onBack} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '3rem 1.5rem 5rem' : '5rem 2rem 7rem', display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>

        {/* Colonne gauche — infos */}
        <div>
          <p style={{ color: C.accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Contact</p>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, color: C.textDark, marginBottom: '1.25rem', lineHeight: 1.15 }}>
            Une question ?<br />On vous répond.
          </h1>
          <p style={{ color: C.textMid, fontSize: '1rem', lineHeight: 1.75, marginBottom: '3rem', maxWidth: '380px' }}>
            Notre équipe est disponible pour répondre à toutes vos questions concernant nos services, la mise en demeure ou votre dossier en cours.
          </p>

        </div>

        {/* Colonne droite — formulaire */}
        <div style={{ marginTop: isMobile ? '3rem' : 0 }}>
          {sent ? (
            <div style={{ background: '#F8FBF8', border: '1px solid #C6E8CC', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(59,173,122,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3BAD7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <p style={{ fontWeight: 700, color: C.textDark, fontSize: '1.2rem', marginBottom: '0.6rem' }}>Message envoyé !</p>
              <p style={{ color: C.textMid, fontSize: '0.95rem', lineHeight: 1.65 }}>Nous vous répondrons sous 24h à l'adresse<br /><strong>{form.email}</strong></p>
            </div>
          ) : (
            <div style={{ background: '#FAFAF8', borderRadius: '20px', padding: isMobile ? '2rem 1.5rem' : '2.5rem', border: '1px solid #ECEAE5' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: C.textDark, marginBottom: '1.75rem' }}>Envoyer un message</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { key: 'nom',   label: 'Nom complet',   type: 'text',  placeholder: 'Jean Dupont' },
                    { key: 'email', label: 'Adresse email', type: 'email', placeholder: 'jean@exemple.fr' },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>{label}</label>
                      <input type={type} required placeholder={placeholder} value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.background = '#fff'; }}
                        onBlur={e => { e.target.style.borderColor = '#E8E6E1'; e.target.style.background = '#FAFAF8'; }}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Sujet</label>
                  <select value={form.sujet} required onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Sélectionnez un sujet</option>
                    <option>Question sur mon dossier</option>
                    <option>Problème technique</option>
                    <option>Information sur les tarifs</option>
                    <option>Partenariat</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Message</label>
                  <textarea required placeholder="Décrivez votre demande en détail..." value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#E8E6E1'; e.target.style.background = '#FAFAF8'; }}
                  />
                </div>
                <button type="submit" disabled={loading}
                  style={{ background: loading ? '#ccc' : C.accent, color: C.textDark, border: 'none', padding: '1rem 2rem', borderRadius: '10px', fontFamily: F, fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.accentHover; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.accent; }}>
                  {loading ? 'Envoi en cours…' : <>Envoyer le message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg></>}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: C.textMuted, marginTop: '0.25rem' }}>
                  Vos données sont protégées et ne seront jamais partagées.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Page Suivi Lettre ──────────────────────────────────────── */
const TrackingPage = ({ onBack }) => {
  const isMobile = useIsMobile();
  const [input, setInput]     = useState('');
  const [lettre, setLettre]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const litigeLabel = { facture: 'Facture impayée', loyer: 'Loyer impayé', caution: 'Caution non restituée', travaux: 'Travaux mal réalisés', remboursement: 'Remboursement', autre: 'Autre' };

  const search = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    setLoading(true); setNotFound(false); setLettre(null);
    const { data } = await supabase
      .from('lettres')
      .select('*')
      .eq('tracking_id', input.trim().replace('#', '').toUpperCase())
      .neq('statut', 'brouillon')
      .single();
    setLoading(false);
    if (data) setLettre(data);
    else setNotFound(true);
  };

  const steps = lettre ? [
    { label: 'Lettre générée',              sub: lettre.created_at ? new Date(lettre.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null, done: true },
    { label: 'Paiement confirmé',           sub: lettre.paid_at ? new Date(lettre.paid_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'En attente', done: !!lettre.paid_at },
    { label: 'Envoi lettre recommandée AR', sub: lettre.sent_at ? new Date(lettre.sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'En cours de traitement', done: !!lettre.sent_at },
    { label: 'Accusé de réception signé',  sub: lettre.delivered_at ? new Date(lettre.delivered_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'En attente de signature', done: !!lettre.delivered_at },
  ] : [];

  const currentStep = steps.filter(s => s.done).length;

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: F }}>

      {/* Hero sombre */}
      <div style={{ background: C.primary, paddingBottom: '5rem' }}>
        <AuthTopBar onBack={onBack} darkBg />
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: isMobile ? '2.5rem 1.5rem 0' : '3.5rem 2rem 0', textAlign: 'center' }}>
          <p style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1rem' }}>Suivi d'envoi</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 700, color: '#fff', marginBottom: '0.875rem', lineHeight: 1.15 }}>
            Suivre ma lettre recommandée
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Entrez votre numéro de suivi reçu par email après le paiement.
          </p>

          {/* Barre de recherche */}
          <form onSubmit={search} style={{ display: 'flex', gap: '0', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.25)', maxWidth: '520px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1.1rem', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Numéro de suivi (ex : A1B2C3D4)"
              style={{ flex: 1, padding: '1rem 0.75rem', border: 'none', fontFamily: F, fontSize: '0.95rem', color: C.textDark, background: 'transparent', outline: 'none', letterSpacing: '0.04em' }}
            />
            <button type="submit" disabled={loading} style={{ padding: '0.9rem 1.5rem', background: C.accent, color: C.textDark, border: 'none', fontFamily: F, fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s', flexShrink: 0 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.accentHover; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.accent; }}>
              {loading ? '…' : 'Rechercher'}
            </button>
          </form>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: '640px', margin: '-2.5rem auto 0', padding: isMobile ? '0 1.25rem 4rem' : '0 2rem 5rem', position: 'relative', zIndex: 1 }}>

        {/* Résultat non trouvé */}
        {notFound && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '16px', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#DC2626', fontSize: '0.95rem', marginBottom: '0.3rem' }}>Numéro introuvable</p>
              <p style={{ color: '#B91C1C', fontSize: '0.85rem', lineHeight: 1.6 }}>Vérifiez l'email de confirmation reçu après le paiement. Réessayez sans le symbole #.</p>
            </div>
          </div>
        )}

        {/* Résultat trouvé */}
        {lettre && (
          <div style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${C.borderLight}`, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.10)' }}>

            {/* Carte synthèse */}
            <div style={{ padding: '1.75rem 2rem', background: 'linear-gradient(135deg, #1A1A2E 0%, #2E2E4A 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Destinataire</p>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.3rem' }}>{lettre.destinataire_nom}</p>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.825rem' }}>{litigeLabel[lettre.litige] || lettre.litige}{lettre.montant ? ` · ${Number(lettre.montant).toLocaleString('fr-FR')} €` : ''}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Numéro de suivi</p>
                <p style={{ fontFamily: 'monospace', color: C.accent, fontWeight: 700, fontSize: '1rem', letterSpacing: '0.1em' }}>#{lettre.tracking_id}</p>
                <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(201,169,110,0.15)', padding: '0.25rem 0.7rem', borderRadius: '99px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentStep >= 4 ? '#3BAD7A' : C.accent, animation: currentStep < 4 ? 'pulse 2s infinite' : 'none' }} />
                  <span style={{ color: currentStep >= 4 ? '#3BAD7A' : C.accent, fontSize: '0.72rem', fontWeight: 700 }}>
                    {currentStep >= 4 ? 'Livré' : currentStep >= 3 ? 'En transit' : currentStep >= 2 ? 'Envoyé' : 'Traitement'}
                  </span>
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            <div style={{ padding: '0 2rem', background: '#F8F7F5' }}>
              <div style={{ height: '4px', background: C.borderLight, borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(currentStep / 4) * 100}%`, background: `linear-gradient(90deg, ${C.accent}, #DBBF8A)`, borderRadius: '99px', transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.68rem', color: C.textMuted }}>
                <span>0%</span>
                <span style={{ fontWeight: 600, color: C.accent }}>{Math.round((currentStep / 4) * 100)}% complété</span>
                <span>100%</span>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ padding: '2rem' }}>
              {steps.map((step, i, arr) => (
                <div key={step.label} style={{ display: 'flex', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step.done ? C.accent : '#F0EDE8', border: `2px solid ${step.done ? C.accent : C.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: step.done ? '0 4px 12px rgba(201,169,110,0.35)' : 'none', transition: 'all 0.3s' }}>
                      {step.done
                        ? <svg width="14" height="14" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#CCC' }}>{i + 1}</span>}
                    </div>
                    {i < arr.length - 1 && <div style={{ width: '2px', flex: 1, minHeight: '40px', margin: '6px 0', background: step.done ? C.accent : '#EEE', opacity: step.done ? 0.4 : 1 }} />}
                  </div>
                  <div style={{ paddingBottom: i < arr.length - 1 ? '1.75rem' : 0, paddingTop: '0.4rem' }}>
                    <p style={{ fontWeight: step.done ? 700 : 500, color: step.done ? C.textDark : '#C0C0C0', fontSize: '0.925rem', marginBottom: '0.25rem' }}>{step.label}</p>
                    <p style={{ fontSize: '0.8rem', color: step.done ? C.textMid : '#DDD', lineHeight: 1.5 }}>{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Lien La Poste */}
            {lettre.laposte_tracking && (
              <div style={{ padding: '0 2rem 2rem' }}>
                <a href={`https://www.laposte.fr/outils/suivre-vos-envois?code=${lettre.laposte_tracking}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#F8F7F5', border: `1px solid ${C.borderLight}`, borderRadius: '12px', textDecoration: 'none', transition: 'border-color 0.2s, background 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = '#FDF9F4'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.background = '#F8F7F5'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: C.textDark, fontSize: '0.875rem', marginBottom: '0.1rem' }}>Suivre sur La Poste</p>
                      <p style={{ color: C.textMuted, fontSize: '0.78rem', fontFamily: 'monospace' }}>{lettre.laposte_tracking}</p>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            )}
          </div>
        )}

        {/* État initial — info */}
        {!lettre && !notFound && !loading && (
          <div style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${C.borderLight}`, padding: '2rem', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, text: 'Votre numéro de suivi vous a été envoyé par email après confirmation du paiement.' },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>, text: 'Il se présente sous la forme d\'une suite de lettres et chiffres (ex : A1B2C3D4).' },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>, text: 'Le suivi se met à jour en temps réel à chaque étape de traitement de votre courrier.' },
            ].map(({ icon, text }, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(201,169,110,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
                <p style={{ color: C.textMid, fontSize: '0.875rem', lineHeight: 1.65, paddingTop: '0.5rem' }}>{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Page Tarification ──────────────────────────────────────── */
const PricingPage = ({ onBack, onGo, onLogin }) => {
  const isMobile = useIsMobile();

  const plans = [
    {
      name: 'One-shot',
      price: '19,99',
      period: 'par lettre',
      tag: null,
      desc: 'Idéal pour un litige ponctuel. Payez uniquement quand vous en avez besoin.',
      cta: 'Envoyer ma lettre',
      ctaAction: onGo,
      highlight: false,
      features: [
        'Rédaction personnalisée par IA',
        'Références juridiques incluses',
        'Envoi LRAR certifié via AR24',
        'Accusé de réception inclus',
        'Suivi en temps réel',
        'Valeur juridique reconnue',
      ],
    },
    {
      name: 'Pro',
      price: '49,99',
      period: 'par mois',
      tag: 'Bientôt disponible',
      desc: 'Pour les professionnels et les entreprises qui gèrent plusieurs dossiers.',
      cta: 'Être notifié',
      ctaAction: onLogin,
      highlight: true,
      features: [
        'Lettres illimitées',
        'Tableau de bord multi-dossiers',
        'Modèles personnalisés',
        'Envoi LRAR certifié via AR24',
        'Accusé de réception inclus',
        'Support prioritaire',
        'Export PDF & historique',
        'Facturation mensuelle ou annuelle',
      ],
    },
  ];

  const CheckIcon = () => (
    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(59,173,122,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="#3BAD7A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: F }}>
      <AuthTopBar onBack={onBack} />

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: isMobile ? '3rem 1.5rem 2rem' : '5rem 2rem 3rem' }}>
        <p style={{ color: C.accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Tarifs</p>
        <h1 style={{ fontFamily: F, fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, color: C.textDark, marginBottom: '1rem', lineHeight: 1.15 }}>
          Simple, transparent, sans surprise
        </h1>
        <p style={{ color: C.textMid, fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto' }}>
          Aucun abonnement forcé. Payez uniquement ce dont vous avez besoin.
        </p>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: isMobile ? '1rem 1.25rem 4rem' : '1rem 2rem 6rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {plans.map(plan => (
          <div key={plan.name} style={{
            background: plan.highlight ? C.primary : '#fff',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: plan.highlight ? '0 20px 60px rgba(26,26,46,0.25)' : '0 4px 32px rgba(0,0,0,0.07)',
            border: plan.highlight ? 'none' : `1px solid ${C.borderLight}`,
            position: 'relative',
          }}>
            {plan.tag && (
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: C.accent, color: C.textDark, fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '99px', letterSpacing: '0.04em' }}>
                {plan.tag}
              </div>
            )}

            <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: plan.highlight ? C.accent : C.textMuted, marginBottom: '0.75rem' }}>{plan.name}</p>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.3rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: plan.highlight ? '#fff' : C.textDark, lineHeight: 1 }}>{plan.price}€</span>
              <span style={{ fontSize: '0.9rem', color: plan.highlight ? 'rgba(255,255,255,0.5)' : C.textMuted, marginBottom: '0.4rem' }}>/ {plan.period}</span>
            </div>

            <p style={{ color: plan.highlight ? 'rgba(255,255,255,0.65)' : C.textMid, fontSize: '0.875rem', lineHeight: 1.65, marginBottom: '2rem' }}>{plan.desc}</p>

            <button
              onClick={plan.ctaAction}
              style={{
                width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none',
                fontFamily: F, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                background: plan.highlight ? C.accent : C.primary,
                color: plan.highlight ? C.textDark : '#fff',
                marginBottom: '2rem', transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {plan.cta}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckIcon />
                  <span style={{ fontSize: '0.875rem', color: plan.highlight ? 'rgba(255,255,255,0.8)' : C.textMid }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Garantie */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.borderLight}`, padding: isMobile ? '2.5rem 1.5rem' : '3rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3 style={{ fontFamily: F, fontSize: '1.2rem', fontWeight: 700, color: C.textDark, marginBottom: '0.75rem' }}>Paiement 100% sécurisé</h3>
          <p style={{ color: C.textMid, fontSize: '0.9rem', lineHeight: 1.7 }}>Vos paiements sont traités par Stripe, la référence mondiale en matière de sécurité des transactions en ligne. Aucune donnée bancaire n'est stockée sur nos serveurs.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {[{ src: '/Visa.png', alt: 'Visa' }, { src: '/Mastercard-logo.png', alt: 'Mastercard' }, { src: '/CB LOGO.jpg', alt: 'CB' }].map(({ src, alt }) => (
              <div key={alt} style={{ background: '#F5F5F3', borderRadius: '6px', padding: '5px 10px', height: '32px', width: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={src} alt={alt} style={{ maxHeight: '18px', maxWidth: '40px', objectFit: 'contain' }} />
              </div>
            ))}
            <div style={{ background: '#F5F5F3', borderRadius: '6px', padding: '5px 10px', height: '32px', width: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#635BFF' }}>stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Pages légales ──────────────────────────────────────────── */
const LegalPage = ({ page, onBack }) => {
  const isMobile = useIsMobile();
  const content = {
    mentions: {
      title: "Mentions légales",
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.textLight, marginBottom: '0.5rem' }}>Éditeur du site</h3>
            <p>Ce site est édité à titre personnel dans le cadre d'un projet en phase de validation.</p>
            <p style={{ marginTop: '0.375rem' }}>Responsable de publication : [Votre Nom Prénom]</p>
            <p>Adresse : [Votre adresse]</p>
            <p>Email : contact@miseendemeurerapide.fr</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.textLight, marginBottom: '0.5rem' }}>Hébergement</h3>
            <p>Vercel Inc. — 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
            <p>Site : vercel.com</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.textLight, marginBottom: '0.5rem' }}>Propriété intellectuelle</h3>
            <p>L'ensemble du contenu de ce site (textes, visuels, logo) est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation préalable.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.textLight, marginBottom: '0.5rem' }}>Contact</h3>
            <p>contact@miseendemeurerapide.fr</p>
          </div>
        </div>
      )
    },
    confidentialite: {
      title: "Politique de confidentialité",
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.textLight, marginBottom: '0.5rem' }}>Données collectées</h3>
            <p>Nous collectons uniquement votre adresse email lors de l'inscription à la liste d'attente. Aucune autre donnée n'est collectée.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.textLight, marginBottom: '0.5rem' }}>Finalité du traitement</h3>
            <p>Votre email est utilisé exclusivement pour vous informer du lancement et vous transmettre votre offre d'accès prioritaire.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.textLight, marginBottom: '0.5rem' }}>Base légale</h3>
            <p>Le traitement est fondé sur votre consentement explicite (article 6.1.a du RGPD), recueilli via la case à cocher.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.textLight, marginBottom: '0.5rem' }}>Vos droits</h3>
            <p>Conformément au RGPD, vous disposez d'un droit d'accès, rectification, effacement et opposition : contact@miseendemeurerapide.fr</p>
            <p style={{ marginTop: '0.375rem' }}>Réclamation possible auprès de la CNIL (cnil.fr).</p>
          </div>
        </div>
      )
    },
    cgu: {
      title: "Conditions Générales d'Utilisation",
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.textLight, marginBottom: '0.5rem' }}>Objet</h3>
            <p>Les présentes CGU régissent l'utilisation du site Mise en Demeure Rapide, actuellement en phase de pré-lancement.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.textLight, marginBottom: '0.5rem' }}>Inscription à la liste d'attente</h3>
            <p>En vous inscrivant, vous acceptez d'être contacté(e) par email lors du lancement. Cette inscription ne constitue pas un engagement contractuel quant aux fonctionnalités ou tarifs finaux.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.textLight, marginBottom: '0.5rem' }}>Limitation de responsabilité</h3>
            <p>Le site est fourni à titre informatif. Les informations présentées ne constituent pas un conseil juridique. Pour tout litige, consultez un avocat.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.textLight, marginBottom: '0.5rem' }}>Droit applicable</h3>
            <p>Les présentes CGU sont soumises au droit français. Tout litige relève des tribunaux français.</p>
          </div>
        </div>
      )
    }
  };

  const { title, body } = content[page] || content.mentions;

  return (
    <div style={{ minHeight: '100vh', background: C.primary, fontFamily: F, color: C.textMutedLight }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: isMobile ? '2.5rem 1.25rem' : '3.75rem 2.5rem' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', color: C.textMutedLight, fontFamily: F, fontSize: '0.875rem', cursor: 'pointer', marginBottom: '2.5rem', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = C.textLight}
          onMouseLeave={e => e.currentTarget.style.color = C.textMutedLight}>
          ← Retour
        </button>
        <h1 style={{ fontFamily: F, fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem', color: C.textLight }}>{title}</h1>
        <p style={{ color: C.textMuted, fontSize: '0.8rem', marginBottom: '2.5rem' }}>Dernière mise à jour : 30 mars 2026</p>
        <div style={{ background: C.secondary, borderRadius: '10px', padding: isMobile ? '1.5rem' : '2.5rem', border: `1px solid ${C.borderDark}`, fontSize: '0.95rem', lineHeight: 1.75 }}>
          {body}
        </div>
      </div>
    </div>
  );
};

/* ── Dashboard ───────────────────────────────────────────────── */
const DashboardPage = ({ user, onBack, onNewLettre }) => {
  const isMobile = useIsMobile();
  const [tab, setTab]           = useState('lettres');
  const [profile, setProfile]   = useState(null);
  const [lettres, setLettres]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState('');
  const [editProfile, setEditProfile] = useState({ prenom: '', nom: '', telephone: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const metaPrenom = user?.user_metadata?.prenom || '';
      const metaNom    = user?.user_metadata?.nom    || '';

      const [{ data: prof }, { data: lets }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('lettres').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      if (prof) {
        // Si le profil existe mais prenom/nom sont vides, on utilise les métadonnées
        const prenom = prof.prenom || metaPrenom;
        const nom    = prof.nom    || metaNom;
        setProfile({ ...prof, prenom, nom });
        setEditProfile({ prenom, nom, telephone: prof.telephone || '' });
        // Mise à jour silencieuse si les données étaient manquantes
        if (!prof.prenom && metaPrenom) {
          supabase.from('profiles').update({ prenom: metaPrenom, nom: metaNom }).eq('id', user.id);
        }
      } else {
        // Profil inexistant — on le crée
        const newProf = { id: user.id, prenom: metaPrenom, nom: metaNom };
        await supabase.from('profiles').insert(newProf);
        setProfile(newProf);
        setEditProfile({ prenom: metaPrenom, nom: metaNom, telephone: '' });
      }

      setLettres(lets || []);
      setLoading(false);
    };
    load();
  }, [user.id]);

  const saveProfile = async () => {
    setSaving(true); setSaveMsg('');
    const { error } = await supabase.from('profiles').update(editProfile).eq('id', user.id);
    setSaving(false);
    setSaveMsg(error ? 'Erreur lors de la sauvegarde.' : 'Profil mis à jour ✓');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const statusLabel = (s) => ({ brouillon: 'Brouillon', payee: 'Payée', envoyee: 'Envoyée', livree: 'Livrée' }[s] || s);
  const statusColor = (s) => ({ brouillon: '#999', payee: C.accent, envoyee: '#3B82F6', livree: '#22C55E' }[s] || '#999');
  const statusBg    = (s) => ({ brouillon: '#F3F4F6', payee: 'rgba(201,169,110,0.12)', envoyee: '#EFF6FF', livree: '#F0FDF4' }[s] || '#F3F4F6');

  const prenom = profile?.prenom || user?.user_metadata?.prenom || '';
  const nom    = profile?.nom    || user?.user_metadata?.nom    || '';

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '0.8rem 1rem',
    borderRadius: '8px', border: `1.5px solid ${C.borderLight}`,
    fontFamily: F, fontSize: '0.9rem', color: C.textDark,
    background: '#fff', outline: 'none', transition: 'border-color 0.2s',
  };

  const tabs = [
    { id: 'lettres',     label: 'Mes lettres' },
    { id: 'suivi',       label: 'Suivi' },
    { id: 'profil',      label: 'Mon profil' },
    { id: 'abonnement',  label: 'Abonnement' },
    { id: 'factures',    label: 'Factures' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bgAlt, fontFamily: F }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.borderLight}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem clamp(1.25rem, 5vw, 2.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: 0, marginLeft: '2rem' }}>
            <img src="/LOGO.png" alt="Logo" style={{ height: '1.75rem', width: 'auto' }} />
            {!isMobile && (
              <span style={{ fontFamily: F, fontWeight: 700, color: C.textDark, fontSize: '0.95rem', display: 'flex', flexDirection: 'column', lineHeight: 1.2, alignItems: 'flex-start' }}>
                <span>Mise en Demeure</span>
                <span style={{ color: C.accent, fontSize: '0.7rem', letterSpacing: '0.04em' }}>rapide.fr</span>
              </span>
            )}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: C.primary }}>
              {(prenom[0] || user.email[0]).toUpperCase()}
            </div>
            {!isMobile && <span style={{ fontFamily: F, fontWeight: 600, color: C.textDark, fontSize: '0.9rem' }}>{prenom} {nom}</span>}
            <button onClick={async () => { await supabase.auth.signOut(); onBack(); }} title="Déconnexion" style={{ background: 'none', border: `1.5px solid ${C.borderLight}`, borderRadius: '8px', padding: '0.4rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ width: '100%', boxSizing: 'border-box', padding: '0 clamp(1.25rem, 5vw, 2.5rem)', display: 'flex', gap: 0, overflowX: 'auto', justifyContent: 'center' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? C.accent : 'transparent'}`,
              padding: '0.875rem 1.25rem', fontFamily: F, fontWeight: tab === t.id ? 700 : 500,
              fontSize: '0.875rem', color: tab === t.id ? C.textDark : '#888',
              cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '2rem 1.25rem' : '3rem clamp(1.25rem, 5vw, 2.5rem)' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>Chargement…</div>
        ) : (

          <>
            {/* ── MES LETTRES ── */}
            {tab === 'lettres' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h1 style={{ fontFamily: F, fontSize: '1.5rem', fontWeight: 700, color: C.textDark, marginBottom: '0.25rem' }}>Mes mises en demeure</h1>
                    <p style={{ color: '#888', fontSize: '0.875rem' }}>{lettres.length} lettre{lettres.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={onNewLettre} style={{ background: C.accent, color: C.primary, padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontFamily: F, fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                    Nouvelle lettre
                  </button>
                </div>

                {lettres.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '16px', border: `1px solid ${C.borderLight}` }}>
                    <div style={{ width: '64px', height: '64px', background: C.bgAlt, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>
                    </div>
                    <p style={{ fontWeight: 700, color: C.textDark, fontSize: '1rem', marginBottom: '0.5rem' }}>Aucune lettre pour l'instant</p>
                    <p style={{ color: '#888', fontSize: '0.875rem' }}>Créez votre première mise en demeure en 2 minutes.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {lettres.map(l => (
                      <div key={l.id} style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${C.borderLight}`, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, color: C.textDark, fontSize: '0.925rem' }}>{l.destinataire_nom || 'Destinataire inconnu'}</span>
                            <span style={{ background: statusBg(l.statut), color: statusColor(l.statut), fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                              {statusLabel(l.statut)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>
                              {new Date(l.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            {l.montant && <span style={{ fontSize: '0.8rem', color: '#888' }}>{Number(l.montant).toLocaleString('fr-FR')} €</span>}
                            {l.tracking_id && <span style={{ fontSize: '0.8rem', color: '#aaa', fontFamily: 'monospace' }}>#{l.tracking_id}</span>}
                          </div>
                        </div>
                        {l.litige && (
                          <span style={{ fontSize: '0.78rem', color: '#999', background: C.bgAlt, padding: '0.3rem 0.7rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                            {{ facture: 'Facture impayée', loyer: 'Loyer impayé', caution: 'Caution', travaux: 'Travaux', remboursement: 'Remboursement', autre: 'Autre' }[l.litige] || l.litige}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SUIVI ── */}
            {tab === 'suivi' && (() => {
              const lettresAvecStatut = lettres.filter(l => l.statut !== 'brouillon');

              const steps = (l) => [
                { label: 'Lettre générée',          sub: l.created_at ? new Date(l.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null, done: true },
                { label: 'Paiement confirmé',        sub: l.paid_at ? new Date(l.paid_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : 'En attente', done: !!l.paid_at },
                { label: 'Envoi en lettre recommandée AR', sub: l.sent_at ? new Date(l.sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : 'En attente d\'envoi', done: !!l.sent_at },
                { label: 'Accusé de réception signé', sub: l.delivered_at ? new Date(l.delivered_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : 'En attente de signature', done: !!l.delivered_at },
              ];

              return (
                <div>
                  <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontFamily: F, fontSize: '1.5rem', fontWeight: 700, color: C.textDark, marginBottom: '0.25rem' }}>Suivi des envois</h1>
                    <p style={{ color: '#888', fontSize: '0.875rem' }}>Statut en temps réel de vos lettres recommandées.</p>
                  </div>

                  {lettresAvecStatut.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '16px', border: `1px solid ${C.borderLight}` }}>
                      <div style={{ width: '64px', height: '64px', background: C.bgAlt, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                      </div>
                      <p style={{ fontWeight: 700, color: C.textDark, fontSize: '1rem', marginBottom: '0.5rem' }}>Aucun envoi en cours</p>
                      <p style={{ color: '#888', fontSize: '0.875rem' }}>Le suivi apparaîtra ici une fois votre lettre payée et envoyée.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {lettresAvecStatut.map(l => (
                        <div key={l.id} style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${C.borderLight}`, overflow: 'hidden' }}>
                          {/* En-tête lettre */}
                          <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                              <p style={{ fontWeight: 700, color: C.textDark, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{l.destinataire_nom || 'Destinataire'}</p>
                              <p style={{ color: '#888', fontSize: '0.8rem' }}>
                                { { facture: 'Facture impayée', loyer: 'Loyer impayé', caution: 'Caution non restituée', travaux: 'Travaux mal réalisés', remboursement: 'Remboursement', autre: 'Autre' }[l.litige] || l.litige }
                                {l.montant ? ` · ${Number(l.montant).toLocaleString('fr-FR')} €` : ''}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                              {l.tracking_id && (
                                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#999', background: C.bgAlt, padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                                  #{l.tracking_id}
                                </span>
                              )}
                              <span style={{ background: statusBg(l.statut), color: statusColor(l.statut), fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: '20px' }}>
                                {statusLabel(l.statut)}
                              </span>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div style={{ padding: '1.5rem' }}>
                            {steps(l).map((step, i, arr) => (
                              <div key={step.label} style={{ display: 'flex', gap: '1rem', marginBottom: i < arr.length - 1 ? '0.25rem' : 0 }}>
                                {/* Indicateur + ligne */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                  <div style={{
                                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                                    background: step.done ? C.accent : C.bgAlt,
                                    border: `2px solid ${step.done ? C.accent : C.borderLight}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    {step.done
                                      ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                      : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.borderLight }} />
                                    }
                                  </div>
                                  {i < arr.length - 1 && (
                                    <div style={{ width: '2px', flex: 1, background: step.done ? C.accent : C.borderLight, margin: '4px 0', minHeight: '28px', opacity: step.done ? 0.4 : 1 }} />
                                  )}
                                </div>
                                {/* Texte */}
                                <div style={{ paddingBottom: i < arr.length - 1 ? '1rem' : 0 }}>
                                  <p style={{ fontWeight: step.done ? 600 : 400, color: step.done ? C.textDark : '#aaa', fontSize: '0.875rem', marginBottom: '0.15rem' }}>{step.label}</p>
                                  <p style={{ fontSize: '0.775rem', color: step.done ? '#888' : '#ccc' }}>{step.sub}</p>
                                </div>
                              </div>
                            ))}

                            {/* Lien La Poste */}
                            {l.laposte_tracking && (
                              <a href={`https://www.laposte.fr/outils/suivre-vos-envois?code=${l.laposte_tracking}`} target="_blank" rel="noopener noreferrer" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem',
                                background: C.bgAlt, border: `1px solid ${C.borderLight}`,
                                padding: '0.6rem 1rem', borderRadius: '8px',
                                fontFamily: F, fontSize: '0.8rem', fontWeight: 600, color: C.textDark,
                                textDecoration: 'none', transition: 'border-color 0.2s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                              onMouseLeave={e => e.currentTarget.style.borderColor = C.borderLight}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                                Suivre sur La Poste — {l.laposte_tracking}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── MON PROFIL ── */}
            {tab === 'profil' && (
              <div style={{ maxWidth: '580px' }}>
                <h1 style={{ fontFamily: F, fontSize: '1.5rem', fontWeight: 700, color: C.textDark, marginBottom: '0.25rem' }}>Mon profil</h1>
                <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '2rem' }}>Vos informations personnelles.</p>

                <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${C.borderLight}`, padding: isMobile ? '1.75rem 1.5rem' : '2.25rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Prénom</label>
                      <input value={editProfile.prenom} onChange={e => setEditProfile(p => ({ ...p, prenom: e.target.value }))} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Nom</label>
                      <input value={editProfile.nom} onChange={e => setEditProfile(p => ({ ...p, nom: e.target.value }))} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Adresse e-mail</label>
                    <input value={user.email} disabled style={{ ...inputStyle, background: C.bgAlt, color: '#888', cursor: 'not-allowed' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.textDark, marginBottom: '0.4rem' }}>Téléphone <span style={{ fontWeight: 400, color: '#999' }}>(optionnel)</span></label>
                    <input value={editProfile.telephone} onChange={e => setEditProfile(p => ({ ...p, telephone: e.target.value }))} placeholder="+33 6 00 00 00 00" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={saveProfile} disabled={saving} style={{ background: C.primary, color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', border: 'none', fontFamily: F, fontWeight: 700, fontSize: '0.875rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Sauvegarde…' : 'Sauvegarder'}
                    </button>
                    {saveMsg && <span style={{ fontSize: '0.85rem', color: saveMsg.includes('Erreur') ? '#EF4444' : '#22C55E', fontWeight: 600 }}>{saveMsg}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ── ABONNEMENT ── */}
            {tab === 'abonnement' && (
              <div style={{ maxWidth: '580px' }}>
                <h1 style={{ fontFamily: F, fontSize: '1.5rem', fontWeight: 700, color: C.textDark, marginBottom: '0.25rem' }}>Mon abonnement</h1>
                <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '2rem' }}>Votre plan actuel.</p>
                <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${C.borderLight}`, padding: isMobile ? '1.75rem 1.5rem' : '2.25rem 2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
                    <div style={{ background: C.bgAlt, borderRadius: '10px', padding: '0.75rem' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: C.textDark, fontSize: '1rem', marginBottom: '0.15rem' }}>Plan Gratuit</p>
                      <p style={{ color: '#888', fontSize: '0.825rem' }}>Accès one-shot — 19,99 € par lettre</p>
                    </div>
                  </div>
                  <div style={{ background: C.bgAlt, borderRadius: '10px', padding: '1.25rem 1.5rem', border: `1px dashed ${C.borderLight}` }}>
                    <p style={{ fontWeight: 700, color: C.textDark, fontSize: '0.9rem', marginBottom: '0.35rem' }}>Offres à venir</p>
                    <p style={{ color: '#888', fontSize: '0.825rem', lineHeight: 1.6 }}>Des plans d'abonnement avec tarifs réduits et fonctionnalités avancées seront disponibles prochainement.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── FACTURES ── */}
            {tab === 'factures' && (
              <div>
                <h1 style={{ fontFamily: F, fontSize: '1.5rem', fontWeight: 700, color: C.textDark, marginBottom: '0.25rem' }}>Mes factures</h1>
                <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '2rem' }}>Historique de vos paiements.</p>
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '16px', border: `1px solid ${C.borderLight}` }}>
                  <div style={{ width: '64px', height: '64px', background: C.bgAlt, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                  </div>
                  <p style={{ fontWeight: 700, color: C.textDark, fontSize: '1rem', marginBottom: '0.5rem' }}>Aucune facture pour l'instant</p>
                  <p style={{ color: '#888', fontSize: '0.875rem' }}>Vos factures apparaîtront ici après votre premier paiement.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ── App ────────────────────────────────────────────────────── */
export default function App() {
  const isMobile = useIsMobile();
  const scrolled  = useScrolled();
  const [view, setView]         = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser]         = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* Écoute l'état auth Supabase */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const nav = (v) => { setView(v); window.scrollTo(0, 0); };

  if (authLoading) return null;

  // Retour depuis Stripe
  const urlParams   = new URLSearchParams(window.location.search);
  const paymentStatus   = urlParams.get('payment');
  const trackingReturn  = urlParams.get('tracking');
  if (paymentStatus === 'success' && trackingReturn) {
    window.history.replaceState({}, '', '/');
    return (
      <div style={{ minHeight: '100vh', background: C.bgAlt, fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '500px', background: '#fff', borderRadius: '20px', padding: '3rem 2.5rem', boxShadow: '0 8px 48px rgba(0,0,0,0.07)', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <p style={{ color: C.accent, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Paiement confirmé</p>
          <h1 style={{ fontFamily: F, fontSize: '1.75rem', fontWeight: 700, color: C.textDark, marginBottom: '0.75rem' }}>Votre lettre est en cours d'envoi</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
            Vous recevrez un email de confirmation avec votre numéro de suivi.<br/>
            Votre lettre sera envoyée en recommandé AR sous 24h ouvrées.
          </p>
          <div style={{ background: C.bgAlt, borderRadius: '10px', padding: '1rem', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.3rem' }}>Numéro de suivi</p>
            <p style={{ fontFamily: 'monospace', fontWeight: 700, color: C.textDark, fontSize: '1.1rem', letterSpacing: '0.08em' }}>#{trackingReturn}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user && (
              <button onClick={() => nav('dashboard')} style={{ background: C.primary, color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontFamily: F, fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                Voir dans mon espace
              </button>
            )}
            <button onClick={() => nav('home')} style={{ background: 'none', color: C.textMid, padding: '0.75rem 1.5rem', borderRadius: '8px', border: `1.5px solid ${C.borderLight}`, fontFamily: F, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (paymentStatus === 'cancel') window.history.replaceState({}, '', '/');

  if (view === 'form')            return <FormPage onBack={() => nav('home')} user={user} />;
  if (view === 'contact')         return <ContactPage onBack={() => nav('home')} />;
  if (view === 'pricing')         return <PricingPage onBack={() => nav('home')} onGo={() => nav('form')} onLogin={() => nav('login')} />;
  if (view === 'tracking')        return <TrackingPage onBack={() => nav('home')} />;
  if (view === 'faq')             return <FAQPage onBack={() => nav('home')} onGo={() => nav('form')} />;
  if (view === 'login')           return <LoginPage onBack={() => nav('home')} onRegister={() => nav('register')} onForgot={() => nav('forgot-password')} onSuccess={() => nav(user ? 'dashboard' : 'home')} />;
  if (view === 'register')        return <RegisterPage onBack={() => nav('home')} onLogin={() => nav('login')} onSuccess={() => nav('login')} />;
  if (view === 'forgot-password') return <ForgotPasswordPage onBack={() => nav('home')} onLogin={() => nav('login')} />;
  if (view === 'dashboard')       return <DashboardPage user={user} onBack={() => nav('home')} onNewLettre={() => nav('form')} />;
  if (['mentions', 'confidentialite', 'cgu'].includes(view)) return <LegalPage page={view} onBack={() => nav('home')} />;

  const go        = () => nav('form');
  const goFaq     = () => nav('faq');
  const goLogin   = () => nav('login');
  const goContact = () => nav('contact');

  /* ── Shared styles ── */
  const container = {
    maxWidth: MAX_W, margin: '0 auto',
    padding: '0 clamp(1.25rem, 5vw, 2.5rem)',
  };
  const sectionPad = 'clamp(3.5rem, 8vw, 7rem) 0';

  /* ── Data ── */
  const situations = [
    {
      title: "Loyer impayé ou caution non rendue",
      desc: "Votre propriétaire refuse de rendre votre dépôt de garantie ou votre locataire ne paie plus son loyer.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 9L12 3L21 9V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      title: "Produit non livré ou défectueux",
      desc: "Vous avez commandé en ligne et le vendeur ne livre pas, ou le produit ne correspond pas à la description.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 2H18L20 7H4L6 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 7V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M9 11H15M9 15H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      title: "Facture impayée",
      desc: "Un client ou un partenaire ne règle pas votre facture malgré vos relances. La mise en demeure change tout.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M7 9H17M7 13H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 17H18M17 16V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      title: "Travaux mal réalisés",
      desc: "Un artisan ou prestataire n'a pas respecté ses engagements ou a laissé un chantier inachevé.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14.7 6.3L17.7 9.3L7 20H4V17L14.7 6.3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.5 8.5L15.5 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  const steps = [
    {
      num: '01',
      icon: <FileText size={26} strokeWidth={1.5} />,
      title: "Décrivez votre situation",
      desc: "Répondez à quelques questions simples sur votre litige. Aucune connaissance juridique requise — nous guidons chaque étape.",
    },
    {
      num: '02',
      icon: <Zap size={26} strokeWidth={1.5} />,
      title: "Votre mise en demeure est rédigée",
      desc: "Notre système génère un courrier conforme au droit français, avec les références juridiques adaptées à votre cas précis.",
    },
    {
      num: '03',
      icon: <Send size={26} strokeWidth={1.5} />,
      title: "Envoi en recommandé avec AR",
      desc: "Votre mise en demeure est envoyée par lettre recommandée avec accusé de réception. Vous n'avez rien d'autre à faire.",
    },
  ];

  const testimonials = [
    {
      text: "Mon propriétaire refusait de me rendre ma caution depuis 6 mois. J'ai envoyé la mise en demeure un lundi, j'ai reçu le virement le vendredi suivant.",
      author: "Sophie M.",
      role: "Locataire à Lyon — Dépôt de garantie",
    },
    {
      text: "Un client me devait 3 200€ depuis 4 mois. Après la mise en demeure, il a payé sous 10 jours. Pour 19,99€, c'est le meilleur investissement de l'année.",
      author: "Karim B.",
      role: "Auto-entrepreneur — Facture impayée",
    },
    {
      text: "J'avais commandé un meuble à 800€ jamais livré. Le vendeur ne répondait plus. Après réception de la mise en demeure, il m'a remboursé intégralement.",
      author: "Claire D.",
      role: "Particulière — Produit non livré",
    },
  ];

  const faqs = faqsData;

  /* ── Render ── */
  return (
    <div style={{ minHeight: '100vh', fontFamily: F, background: C.primary }}>

      {/* ── MOBILE MENU OVERLAY ── */}
      {menuOpen && isMobile && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: C.bg,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '2.5rem',
        }}>
          {[
            { label: 'Comment ça marche', action: () => { setMenuOpen(false); document.getElementById('comment-ca-marche')?.scrollIntoView({ behavior: 'smooth' }); } },
            { label: 'Témoignages',        action: () => { setMenuOpen(false); document.getElementById('temoignages')?.scrollIntoView({ behavior: 'smooth' }); } },
            { label: 'FAQ',                action: () => { setMenuOpen(false); goFaq(); } },
            { label: 'Se connecter',       action: () => { setMenuOpen(false); goLogin(); } },
          ].map(({ label, action }) => (
            <button key={label} onClick={action} style={{
              background: 'none', border: 'none', fontFamily: F, fontSize: '2rem', color: C.textDark, fontWeight: 600,
              cursor: 'pointer', transition: 'color 0.2s', padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.accent}
            onMouseLeave={e => e.currentTarget.style.color = C.textDark}>
              {label}
            </button>
          ))}
          <button onClick={() => { go(); setMenuOpen(false); }} style={{
            background: C.accent, color: C.primary, padding: '1rem 2.5rem',
            borderRadius: '8px', border: 'none', fontFamily: F, fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
            Créer ma mise en demeure
          </button>
        </div>
      )}

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '1.25rem 0',
        background: scrolled ? C.bg : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
      }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '0 clamp(2rem, 6vw, 5rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
          <button onClick={() => { setView('home'); window.scrollTo(0, 0); }} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
          }}>
            <img src="/LOGO.png" alt="Logo" style={{ height: '2rem', width: 'auto', display: 'block' }} />
            {!isMobile && (
              <span style={{ fontFamily: F, fontWeight: 700, color: C.textDark, letterSpacing: '0.01em', lineHeight: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.1rem' }}>Mise en Demeure</span>
                <span style={{ fontSize: '0.72rem', color: C.accent, fontWeight: 600, letterSpacing: '0.04em' }}>rapide.fr</span>
              </span>
            )}
          </button>

          {/* Desktop buttons */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {user ? (
                <UserMenu user={user} onDashboard={() => nav('dashboard')} onLogout={async () => { await supabase.auth.signOut(); }} />
              ) : (
                <>
                  <button onClick={goContact} style={{
                    background: C.accent, color: C.textDark, padding: '0.6rem 1.25rem',
                    borderRadius: '8px', border: `2px solid ${C.accent}`, fontFamily: F, fontWeight: 700, fontSize: '0.875rem',
                    cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.borderColor = C.accentHover; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.borderColor = C.accent; }}>
                    Contactez-nous
                  </button>
                  <button onClick={goLogin} style={{
                    background: C.primary, color: '#fff', padding: '0.6rem 1.25rem',
                    borderRadius: '8px', border: `2px solid ${C.primary}`, fontFamily: F, fontWeight: 700, fontSize: '0.875rem',
                    cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.secondary; e.currentTarget.style.borderColor = C.secondary; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.borderColor = C.primary; }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    Se connecter
                  </button>
                </>
              )}
            </div>
          )}

          {/* Hamburger */}
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', cursor: 'pointer', minWidth: '44px', minHeight: '44px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ display: 'block', width: '22px', height: '2px', background: C.textDark, borderRadius: '2px', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none', transition: 'transform 0.3s ease' }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: C.textDark, borderRadius: '2px', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.3s ease' }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: C.textDark, borderRadius: '2px', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none', transition: 'transform 0.3s ease' }} />
            </button>
          )}
        </div>
      </nav>
      {/* ── HERO ── */}
      <section id="hero" style={{
        minHeight: isMobile ? 'auto' : '100vh', display: 'flex', alignItems: 'center',
        paddingTop: isMobile ? '5rem' : '5rem',
        paddingBottom: isMobile ? '3rem' : '0',
        background: C.bg,
      }}>
        
        <div style={{ ...container, width: '100%', padding: `${isMobile ? '2rem' : 'clamp(3rem, 6vw, 5rem)'} clamp(1.25rem, 5vw, 2.5rem)` }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '0.9fr 1.1fr',
            gap: isMobile ? '0' : '4rem',
            alignItems: 'center',
          }}>
            {/* Visual — desktop only, gauche */}
            {!isMobile && (
              <Reveal direction="left">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <HeroDocMockup />
                </div>
              </Reveal>
            )}

            {/* Text — droite */}
            <div>
              <Reveal delay={100}>
                <h1 style={{ fontFamily: F, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.2, color: C.textDark, marginBottom: '1.25rem' }}>
                  <span style={{ display: 'block', color: C.accent, marginBottom: '0.1em' }}>Mise en demeure</span>
                  <span style={{ display: 'block' }}>en ligne avec accusé de réception</span>
                </h1>
              </Reveal>

              <Reveal delay={200}>
                <div style={{ marginBottom: '2.25rem', maxWidth: '500px' }}>
                  <p style={{ color: C.textMid, fontSize: isMobile ? '1rem' : '1.1rem', lineHeight: 1.7, marginBottom: '0.5rem' }}>
                    Envoyez une lettre légale en 2 minutes et augmentez vos chances d'être payé.
                  </p>
                  <p style={{ color: C.textMuted, fontSize: '0.82rem', lineHeight: 1.6, opacity: 0.7, fontStyle: 'italic' }}>
                    Pour factures impayées, loyers, litiges entre particuliers ou professionnels.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={300}>
                <div style={{ display: 'flex', gap: '0.75rem', flexDirection: isMobile ? 'column' : 'row', marginBottom: '2rem' }}>
                  <button onClick={go} style={{
                    background: C.accent, color: C.textDark,
                    padding: '1.1rem 2.25rem', borderRadius: '8px', border: `2px solid ${C.accent}`,
                    fontFamily: F, fontWeight: 700, fontSize: '1.05rem',
                    cursor: 'pointer', transition: 'all 0.3s ease',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    boxShadow: '0 4px 24px rgba(201,168,76,0.25)',
                    whiteSpace: 'nowrap',
                    width: isMobile ? '100%' : 'auto',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,168,76,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(201,168,76,0.25)'; }}
                  aria-label="Envoyer une mise en demeure">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
                    Envoyer une mise en demeure
                  </button>
                  <button style={{
                    padding: '1.1rem 1.75rem', borderRadius: '8px',
                    border: `2px solid ${C.borderLight}`,
                    fontFamily: F, fontWeight: 700, fontSize: '1.05rem',
                    cursor: 'pointer', transition: 'all 0.3s ease',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    background: 'none', color: C.textMid,
                    width: isMobile ? '100%' : 'auto',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.color = C.textMid; }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    M'abonner
                  </button>
                </div>
                <p style={{ color: C.textMuted, fontSize: '0.72rem', lineHeight: 1.6, opacity: 0.7, fontStyle: 'italic', marginTop: '0.75rem' }}>
                  Conforme aux articles 1344 et suivants du Code civil.
                </p>
              </Reveal>

              <Reveal delay={400}>
                <div style={{ display: 'flex', gap: '1rem 1.5rem', flexWrap: 'wrap', paddingTop: '1.5rem', borderTop: `1px solid ${C.borderLight}` }}>
                  {['Valeur juridique reconnue', 'Recommandé avec AR inclus', 'En 2 minutes', 'Sans avocat'].map(label => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.textMuted, fontSize: '0.825rem' }}>
                      <CheckCircle size={13} color={C.success} />
                      {label}
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.textMuted, fontSize: '0.825rem' }}>
                    <CheckCircle size={13} color={C.success} />
                    Envoi sécurisé via
                    <img src="/AR24.png" alt="AR24" style={{ height: '26px', width: 'auto', objectFit: 'contain', display: 'block' }} />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section id="solution" style={{ background: C.bg, padding: sectionPad }}>
        <div style={{ ...container, maxWidth: '980px' }}>
          <Reveal>
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              boxShadow: '0 8px 48px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              padding: isMobile ? '2rem 1.75rem' : '2.5rem 4rem 2.5rem 3rem',
              position: 'relative',
              minHeight: isMobile ? 'auto' : '320px',
            }}>
                <h2 style={{ fontFamily: F, fontSize: '1.65rem', fontWeight: 700, lineHeight: 1.2, color: C.textDark, marginBottom: '0.875rem', whiteSpace: 'nowrap' }}>
                  Une solution simple pour faire valoir vos droits
                </h2>
                <p style={{ color: C.textMid, fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem', whiteSpace: 'nowrap' }}>
                  La mise en demeure est l'étape clé pour obtenir un paiement ou résoudre un litige, sans avocat.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'Valeur juridique reconnue', desc: 'Conforme aux articles 1344 et suivants du Code civil.' },
                    { label: 'Preuve opposable en justice', desc: 'Envoi en LRAR via La Poste avec accusé de réception.' },
                    { label: 'Accessible à tous, en 2 minutes', desc: 'Aucune connaissance juridique requise.' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'rgba(59,173,122,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="#3BAD7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: C.textDark, fontSize: '0.95rem', marginBottom: '0.15rem' }}>{item.label}</p>
                        <p style={{ color: C.textMid, fontSize: '0.875rem', lineHeight: 1.55 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={goFaq} style={{
                  marginTop: '2rem', alignSelf: 'flex-start',
                  background: 'none', border: 'none', padding: 0,
                  fontFamily: F, fontSize: '0.875rem', fontWeight: 600,
                  color: C.accent, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  transition: 'gap 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.gap = '0.6rem'; }}
                onMouseLeave={e => { e.currentTarget.style.gap = '0.35rem'; }}>
                  En savoir plus
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                {!isMobile && (
                  <img
                    src="/image tablette.png"
                    alt="Aperçu mise en demeure"
                    style={{
                      position: 'absolute',
                      bottom: '3.75rem',  // ← MONTER/DESCENDRE
                      right: '4rem',     // ← GAUCHE/DROITE
                      height: '200px',   // ← TAILLE
                      width: 'auto',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                    }}
                  />
                )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURES 2×2 ── */}
      <section id="avantages" style={{ background: C.bg, padding: sectionPad }}>
        
        <div style={container}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.5rem' : '3.5rem' }}>
              <p style={{ color: C.accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.875rem', fontFamily: F }}>
                Nos avantages
              </p>
              <h2 style={{ fontFamily: F, fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', fontWeight: 600, lineHeight: 1.2, color: C.textDark }}>
                Tout ce qu'il vous faut pour être payé
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: '1.25rem', alignItems: 'stretch' }}>
            {[
              {
                title: 'Augmentez vos chances d\'être payé',
                desc: 'Une mise en demeure formelle crée une pression immédiate sur le débiteur. Dans 70% des cas, le litige se règle sans procédure judiciaire.',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              },
              {
                title: 'Relance automatique',
                desc: 'Nous relançons pour vous sans effort. Des relances sont envoyées automatiquement pour maximiser vos chances d\'être payé.',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              },
              {
                title: 'Envoi recommandé avec accusé de réception',
                desc: 'Preuve légale de réception pour renforcer votre demande. Votre courrier est tracé et opposable devant les tribunaux.',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="19" cy="18" r="4" fill={C.bgLight} stroke={C.success} strokeWidth="1.5"/><path d="M17 18l1.5 1.5 3-3" stroke={C.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              },
              {
                title: 'Modèle juridique prêt à l\'emploi',
                desc: 'Lettre conforme et structurée pour maximiser son impact. Rédigée selon le droit français avec les références légales adaptées à votre situation.',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={isMobile ? 0 : i * 80} style={{ height: '100%', display: 'flex' }}>
                <article style={{
                  background: C.white, border: `1px solid ${C.borderLight}`, borderRadius: '12px',
                  padding: isMobile ? '1.75rem 1.5rem' : '2rem 1.75rem',
                  transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  flex: 1, boxSizing: 'border-box',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(10,22,40,0.1)'; e.currentTarget.style.borderColor = C.accent; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = C.borderLight; }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(201,168,76,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.125rem', color: C.accent }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontFamily: F, fontSize: '1.05rem', fontWeight: 700, color: C.textDark, marginBottom: '0.5rem' }}>{f.title}</h3>
                  <p style={{ color: C.textMuted, fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="comment-ca-marche" style={{ background: C.bg, padding: sectionPad }}>
        
        <div style={container}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? '3rem' : '5rem' }}>
              <p style={{ color: C.accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.875rem', fontFamily: F }}>
                Simple et rapide
              </p>
              <h2 style={{ fontFamily: F, fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', fontWeight: 600, lineHeight: 1.2, color: C.textDark }}>
                Comment ça marche
              </h2>
              <p style={{ color: C.textMid, marginTop: '0.75rem', fontSize: '1.05rem' }}>
                Aucune connaissance juridique requise.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '4rem' : '6rem' }}>
            {/* Étape 1 — image gauche, texte droite */}
            <Reveal>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '2rem' : '5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <img src="/etape 1.png" alt="Étape 1" style={{ width: '100%', maxWidth: '480px', borderRadius: '12px', objectFit: 'contain', transform: 'translateY(-1.5rem)' }} />
                </div>
                <div>
                  <p style={{ fontFamily: F, fontSize: '4rem', fontWeight: 700, color: C.accent, opacity: 0.2, lineHeight: 1, marginBottom: '0.5rem', userSelect: 'none' }}>01</p>
                  <h3 style={{ fontFamily: F, fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', fontWeight: 600, color: C.textDark, marginBottom: '0.875rem' }}>
                    Rédigez votre mise en demeure
                  </h3>
                  <p style={{ color: C.textMid, fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.25rem' }}>
                    Décrivez simplement votre situation en quelques minutes. Notre système génère un courrier conforme au droit français, avec les références juridiques adaptées à votre cas.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Étape 2 — texte gauche, image droite */}
            <Reveal>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '2rem' : '5rem', alignItems: 'center' }}>
                {isMobile && (
                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <img src="/etape 2.png" alt="Étape 2" style={{ width: '100%', maxWidth: '480px', borderRadius: '12px', objectFit: 'contain' }} />
                  </div>
                )}
                <div>
                  <p style={{ fontFamily: F, fontSize: '4rem', fontWeight: 700, color: C.accent, opacity: 0.2, lineHeight: 1, marginBottom: '0.5rem', userSelect: 'none' }}>02</p>
                  <h3 style={{ fontFamily: F, fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', fontWeight: 600, color: C.textDark, marginBottom: '0.875rem' }}>
                    Nous envoyons votre lettre pour vous
                  </h3>
                  <p style={{ color: C.textMid, fontSize: '1rem', lineHeight: 1.75 }}>
                    Une fois votre mise en demeure validée, nous gérons l'impression et l'envoi en lettre recommandée avec accusé de réception via La Poste. Vous n'avez rien d'autre à faire.
                  </p>
                </div>
                {!isMobile && (
                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <img src="/etape 2.png" alt="Étape 2" style={{ width: '100%', maxWidth: '480px', borderRadius: '12px', objectFit: 'contain' }} />
                  </div>
                )}
              </div>
            </Reveal>

            {/* Étape 3 — image gauche, texte droite */}
            <Reveal>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '2rem' : '5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <img src="/etape 3.png" alt="Étape 3" style={{ width: '100%', maxWidth: '320px', borderRadius: '12px', objectFit: 'contain', transform: 'translateY(-0.75rem)' }} />
                </div>
                <div>
                  <p style={{ fontFamily: F, fontSize: '4rem', fontWeight: 700, color: C.accent, opacity: 0.2, lineHeight: 1, marginBottom: '0.5rem', userSelect: 'none' }}>03</p>
                  <h3 style={{ fontFamily: F, fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', fontWeight: 600, color: C.textDark, marginBottom: '0.875rem' }}>
                    Nous relançons automatiquement pour vous
                  </h3>
                  <p style={{ color: C.textMid, fontSize: '1rem', lineHeight: 1.75 }}>
                    Des relances sont envoyées automatiquement pour maximiser vos chances d'être payé. Sans effort de votre part, nous maintenons la pression légale sur le débiteur.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── EFFICACITÉ ── */}
      <section id="efficacite" style={{ background: C.bg, padding: sectionPad }}>
        
        <div style={container}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.5rem' : '3.5rem' }}>
              <p style={{ color: C.accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.875rem', fontFamily: F }}>
                Ce que dit la loi
              </p>
              <h2 style={{ fontFamily: F, fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', fontWeight: 600, lineHeight: 1.2, color: C.textDark }}>
                Pourquoi la mise en demeure est si efficace
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '1.5rem', alignItems: 'stretch' }}>
            {/* Stat count-up */}
            <Reveal delay={100} style={{ display: 'flex' }}>
              <div style={{ background: C.white, border: `1px solid ${C.borderLight}`, borderRadius: '10px', padding: '2.25rem 2rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', flex: 1 }}>
                <div style={{ fontFamily: F, fontSize: '3.5rem', fontWeight: 700, color: C.accent, lineHeight: 1, marginBottom: '0.875rem' }}>
                  70%
                </div>
                <p style={{ color: C.textMuted, fontSize: '0.9rem', lineHeight: 1.7 }}>
                  <strong style={{ color: C.textDark }}>des litiges se résolvent</strong> après réception d'une mise en demeure, sans passer par le tribunal.
                </p>
              </div>
            </Reveal>

            {/* Legal weight */}
            <Reveal delay={200} style={{ display: 'flex' }}>
              <div style={{ background: C.white, border: `1px solid ${C.borderLight}`, borderRadius: '10px', padding: '2.25rem 2rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', flex: 1 }}>
                <div style={{ width: '56px', height: '56px', background: 'rgba(201,168,76,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: C.accent }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <line x1="14" y1="4" x2="14" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="7" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M5 16 Q8 22 11 16" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                    <path d="M17 16 Q20 22 23 16" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                    <line x1="11" y1="24" x2="17" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={{ color: C.textMuted, fontSize: '0.9rem', lineHeight: 1.7 }}>
                  La mise en demeure est une <strong style={{ color: C.textDark }}>obligation légale préalable</strong> à toute action en justice (art. 1344 et suivants du Code civil).
                </p>
              </div>
            </Reveal>

            {/* Recommandé */}
            <Reveal delay={300} style={{ display: 'flex' }}>
              <div style={{ background: C.white, border: `1px solid ${C.borderLight}`, borderRadius: '10px', padding: '2.25rem 2rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', flex: 1 }}>
                <div style={{ width: '56px', height: '56px', background: 'rgba(201,168,76,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: C.accent }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <rect x="3" y="7" width="22" height="15" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M3 10L14 17L25 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="23" cy="21" r="5" fill={C.bgLight} stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M21 21L22.5 22.5L25.5 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p style={{ color: C.textMuted, fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                  Le recommandé avec AR constitue une <strong style={{ color: C.textDark }}>preuve juridique opposable</strong>. Il prouve que votre destinataire a bien reçu votre courrier.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.65rem', color: '#aaa' }}>Envoi sécurisé via</span>
                  <img src="/AR24.png" alt="AR24" style={{ height: '16px', width: 'auto', display: 'block' }} />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0F1629', fontFamily: F }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '3rem 1.5rem 0' : '4.5rem 2.5rem 0' }}>

          {/* Grille 4 colonnes */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1.4fr 1fr 1.2fr 1.4fr', gap: isMobile ? '2.5rem 1.5rem' : '2rem 3rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Col 1 — Navigation */}
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '1.5rem' }}>Navigation</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {[
                  { label: 'Accueil', action: () => nav('home') },
                  { label: 'Tarifs', action: () => nav('pricing') },
                  { label: 'Suivre ma lettre', action: () => nav('tracking') },
                  { label: 'Comment ça marche', action: () => document.getElementById('comment-ca-marche')?.scrollIntoView({ behavior: 'smooth' }) },
                  { label: 'FAQ', action: () => goFaq() },
                  { label: 'Contactez-nous', action: () => nav('contact') },
                ].map(({ label, action }) => (
                  <button key={label} onClick={action} style={{ background: 'none', border: 'none', color: '#8A9BC0', fontSize: '0.875rem', fontFamily: F, cursor: 'pointer', transition: 'color 0.2s', padding: 0, textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#8A9BC0'}>{label}</button>
                ))}
              </div>
            </div>

            {/* Col 2 — Légal */}
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '1.5rem' }}>Légal</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {[
                  { label: 'Conditions générales', v: 'cgu' },
                  { label: 'Politique de confidentialité', v: 'confidentialite' },
                  { label: 'Mentions légales', v: 'mentions' },
                ].map(({ label, v }) => (
                  <button key={label} onClick={() => setView(v)} style={{ background: 'none', border: 'none', color: '#8A9BC0', fontSize: '0.875rem', fontFamily: F, cursor: 'pointer', transition: 'color 0.2s', padding: 0, textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#8A9BC0'}>{label}</button>
                ))}
              </div>
            </div>

            {/* Col 3 — Service */}
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '1.5rem' }}>Notre service</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {['Mise en demeure', 'Envoi LRAR certifié', 'Suivi en temps réel', 'Sans avocat requis'].map(label => (
                  <span key={label} style={{ color: '#8A9BC0', fontSize: '0.875rem' }}>{label}</span>
                ))}
              </div>
            </div>

            {/* Col 4 — Support client */}
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '1.5rem' }}>Support client</p>
              <p style={{ color: '#8A9BC0', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                Notre équipe est disponible pour répondre à toutes vos demandes.
              </p>
              <p style={{ color: '#8A9BC0', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Du lundi au vendredi<br />de 9h00 à 18h00
              </p>
            </div>
          </div>

          {/* Logos paiement centrés */}
          <div style={{ padding: '2rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[{ src: '/Visa.png', alt: 'Visa' }, { src: '/Mastercard-logo.png', alt: 'Mastercard' }, { src: '/CB LOGO.jpg', alt: 'CB' }].map(({ src, alt }) => (
              <div key={alt} style={{ background: '#fff', borderRadius: '6px', padding: '5px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '36px', width: '60px' }}>
                <img src={src} alt={alt} style={{ maxHeight: '22px', maxWidth: '46px', objectFit: 'contain' }} />
              </div>
            ))}
            <div style={{ background: '#fff', borderRadius: '6px', padding: '5px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '36px', width: '60px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#635BFF' }}>stripe</span>
            </div>
          </div>

          {/* Copyright */}
          <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
            <p style={{ color: '#4A5568', fontSize: '0.78rem' }}>© 2026 miseendemeure-rapide.fr — Tous droits réservés.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
