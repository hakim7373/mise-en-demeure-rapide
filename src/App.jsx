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

/* ── Form multi-étapes ──────────────────────────────────────── */
const FormPage = ({ onBack, user }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
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
                  <button key={l.id} type="button" onClick={() => update('litige', l.id)} style={{
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
                  {/* Overlay flou — contenu protégé */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '62%', zIndex: 10, pointerEvents: 'none',
                    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                    background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.75) 100%)',
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 35%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 35%)',
                  }}>
                    <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      </div>
                    </div>
                  </div>
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
                <span>📬 Envoi par <strong style={{ color: C.textDark }}>lettre recommandée AR</strong></span>
                <span>⏱ Délai accordé : <strong style={{ color: C.textDark }}>{data.delai} jours</strong></span>
                {data.montant && <span>💶 Montant : <strong style={{ color: C.textDark }}>{Number(data.montant).toLocaleString('fr-FR')} €</strong></span>}
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
            <button onClick={() => { if (canNext()) setStep(s => s + 1); }} style={{
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
                  🔒 Vos données sont protégées et ne seront jamais partagées.
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
