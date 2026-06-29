const { useState, useEffect } = React;

/*
  jdscience App Preview (mobile-friendly)
  - Playground preview (no Supabase wiring) — uses in-memory store to show full behaviour
  - Main component must be named App (no exports)
  - Mobile responsive, simulated admin add/delete, videos-by-topic, "Coming soon" placeholder
  - Use this to preview layout and interactions. For your real repo, paste the Supabase-wired App.jsx I provided earlier.
*/

const TEAL = '#009688';
const TEAL_DARK = '#004d40';
const BANNER_IMG = 'https://placehold.co/1400x500/004d40/ffffff?text=jdscience.co.uk';
const LEVELS = ['11+', 'GCSE/IGCSE', 'A-Level', 'T-Level', 'BTEC'];
const LEVEL_SUBJECTS = {
  '11+': ['Maths', 'English', 'Verbal Reasoning', 'Non-Verbal Reasoning'],
  'GCSE/IGCSE': ['Physics', 'Chemistry', 'Biology', 'Combined Science', 'Maths'],
  'A-Level': ['Physics', 'Chemistry', 'Biology', 'Maths'],
  'T-Level': ['Core Science', 'Laboratory Sciences', 'The Science Sector'],
  'BTEC': [
    'Unit 1: Principles & Applications of Science I',
    'Unit 2: Practical Scientific Procedures',
    'Unit 3: Science Investigation Skills',
    'Unit 8: Physiology of Human Body Systems',
  ],
};
const LEVEL_BOARDS = {
  '11+': ['GL Assessment', 'CEM'],
  'GCSE/IGCSE': ['AQA', 'Edexcel', 'OCR', 'Eduqas'],
  'A-Level': ['AQA', 'Edexcel', 'OCR'],
  'T-Level': ['NCFE'],
  'BTEC': ['Pearson'],
};
const RES_TYPES = ['Revision Notes', 'Past Questions', 'Mark Schemes', 'Videos'];

function useIsMobile(bp = 760) {
  const [mobile, setMobile] = useState(window.innerWidth <= bp);
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth <= bp);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [bp]);
  return mobile;
}

/* Simple in-memory store to simulate Supabase for preview */
function useMemoryStore(initial = []) {
  const [items, setItems] = useState(initial);
  useEffect(() => { /* seed example item for preview */ }, []);
  const add = (row) => setItems((s) => [...s, Object.assign({ id: Date.now() }, row)]);
  const del = (id) => setItems((s) => s.filter(r => r.id !== id));
  const all = () => items.slice();
  return { items, add, del, all };
}

function Navbar({ onHome, onPick, onResource, onScroll, onSearch, isAdmin, toggleAdmin }) {
  const [q, setQ] = useState('');
  const [openIdx, setOpenIdx] = useState(null);
  const mobile = useIsMobile();

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 60, background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', gap: 12 }}>
        <div onClick={onHome} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>JD</div>
          <div style={{ fontWeight: 800 }}>jdscience.co.uk</div>
        </div>

        {!mobile ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <form onSubmit={(e) => { e.preventDefault(); onSearch(q); }} style={{ display: 'flex', gap: 8 }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search subjects or topics...' style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e6e6e6', width: 220 }} />
              <button style={{ background: TEAL, color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8 }}>Search</button>
            </form>
            <button onClick={() => onScroll('tutor')} style={{ background: '#fbbf24', border: 'none', padding: '8px 12px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}>Become a Tutor</button>
            <button onClick={toggleAdmin} style={{ padding: '8px 12px', borderRadius: 8 }}>{isAdmin ? 'Admin ✓' : 'Admin'}</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onScroll('tutor')} style={{ background: '#fbbf24', border: 'none', padding: '8px 10px', borderRadius: 8, fontWeight: 800 }}>Tutor</button>
            <button onClick={toggleAdmin} style={{ padding: '8px 10px', borderRadius: 8 }}>{isAdmin ? 'On' : 'Admin'}</button>
          </div>
        )}
      </div>

      {/* second nav row */}
      <nav style={{ background: '#ecfeff', padding: '8px 10px', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '6px 8px' }}>
          <button onClick={onHome} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}>Home</button>
          {LEVELS.map((lvl, i) => (
            <div key={lvl} style={{ position: 'relative' }} onMouseEnter={() => setOpenIdx(i)} onMouseLeave={() => setOpenIdx(null)}>
              <button style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}>{lvl} ▾</button>
              {openIdx === i && (
                <div style={{ position: 'absolute', top: '110%', left: 0, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: 8, overflow: 'hidden' }}>
                  {(LEVEL_SUBJECTS[lvl] || []).map(s => <div key={s} onClick={() => onPick(lvl, s)} style={{ padding: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>{s}</div>)}
                </div>
              )}
            </div>
          ))}

          <div style={{ position: 'relative' }}>
            <button style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}>Resources ▾</button>
            <div style={{ position: 'absolute', top: '110%', left: 0, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: 8, overflow: 'hidden' }}>
              {RES_TYPES.map(r => <div key={r} onClick={() => onResource(r)} style={{ padding: 10, cursor: 'pointer' }}>{r}</div>)}
            </div>
          </div>

          <button onClick={() => onScroll('book')} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}>Find a Tutor</button>
          <button onClick={() => onScroll('contact')} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}>Contact</button>
        </div>
      </nav>
    </header>
  );
}

function Hero({ onBrowse, onScroll }) {
  const mobile = useIsMobile();
  return (
    <section style={{ position: 'relative', minHeight: mobile ? 300 : 420, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#fff', overflow: 'hidden' }}>
      <img src={BANNER_IMG} alt='hero' style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,77,64,.82), rgba(0,150,136,.62))' }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 820, padding: '24px' }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.12)', padding: '6px 12px', borderRadius: 16, marginBottom: 10, fontWeight: 700 }}>🏆 Expert Science & Maths Tutoring</div>
        <h1 style={{ fontSize: mobile ? 26 : 42, margin: '10px 0', lineHeight: 1.1, fontWeight: 900 }}>Learn Smarter. Revise Better. <span style={{ color: '#fbbf24' }}>Achieve More.</span></h1>
        <p style={{ color: 'rgba(255,255,255,.95)', margin: '8px auto', maxWidth: 650 }}>Free past papers, revision notes & mark schemes for 11+, GCSE/IGCSE, A-Level, T-Level and BTEC — plus expert 1-to-1 tutoring.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
          <button onClick={onBrowse} style={{ padding: '10px 18px', borderRadius: 8, background: '#fff', border: 'none', color: TEAL_DARK, fontWeight: 800 }}>Browse Resources</button>
          <button onClick={() => onScroll('book')} style={{ padding: '10px 18px', borderRadius: 8, border: '2px solid rgba(255,255,255,.7)', background: 'transparent', color: '#fff', fontWeight: 800 }}>Book a Tutor</button>
          <button onClick={() => onScroll('tutor')} style={{ padding: '10px 18px', borderRadius: 8, background: '#fbbf24', border: 'none', color: '#0f172a', fontWeight: 800 }}>Become a Tutor</button>
        </div>
      </div>
    </section>
  );
}

function LevelGrid({ onLevel }) {
  const mobile = useIsMobile();
  const blurb = { '11+': 'Entrance exam prep & practice', 'GCSE/IGCSE': 'Years 10–11 · all boards', 'A-Level': 'Years 12–13 · exam-ready', 'T-Level': 'Technical qualifications', 'BTEC': 'Vocational courses' };
  return (
    <section style={{ padding: mobile ? '24px 12px' : '40px 20px', background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center' }}>Choose Your Level</h2>
        <p style={{ textAlign: 'center', color: '#64748b' }}>Pick where you're studying — then choose your subject</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginTop: 20 }}>
          {LEVELS.map(l => (
            <div key={l} onClick={() => onLevel(l)} style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', borderRadius: 12, padding: 18, cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,.08)' }}>
              <div style={{ fontWeight: 900 }}>{l}</div>
              <div style={{ marginTop: 8, opacity: .95 }}>{blurb[l]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PastPapers({ initialLevel, initialSubject, initialRes, isAdmin, store }) {
  const mobile = useIsMobile();
  const [activeLevel, setActiveLevel] = useState(initialLevel || 'GCSE/IGCSE');
  const [activeSubject, setActiveSubject] = useState(initialSubject || LEVEL_SUBJECTS['GCSE/IGCSE'][0]);
  const [activeRes, setActiveRes] = useState(initialRes || 'Past Questions');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(true); setTimeout(() => { setResources(store.all()); setLoading(false); }, 200); }, [store]);

  useEffect(() => {
    const subs = LEVEL_SUBJECTS[activeLevel] || [];
    if (subs.length && subs.indexOf(activeSubject) === -1) setActiveSubject(subs[0]);
  }, [activeLevel]);

  const videoItems = () => resources.filter(r => r.res_type === 'Videos' && r.subject === activeSubject && r.level === activeLevel);
  const itemsForBoard = (board) => resources.filter(r => r.res_type === activeRes && r.subject === activeSubject && r.level === activeLevel && r.board === board);

  const addItem = async (board) => {
    const title = window.prompt(board ? 'Resource title (e.g. Paper 1 — June 2023):' : 'Video topic (e.g. Forces — Newton\'s Laws):');
    if (!title) return;
    const url = window.prompt('Paste the URL (YouTube / Drive / public link):');
    if (!url) return;
    store.add({ res_type: board ? activeRes : 'Videos', subject: activeSubject, level: activeLevel, board: board || null, title, url });
    setResources(store.all());
  };
  const deleteItem = (id) => { if (!confirm('Delete?')) return; store.del(id); setResources(store.all()); };

  const boards = LEVEL_BOARDS[activeLevel] || [];
  const isVideos = activeRes === 'Videos';

  return (
    <section style={{ padding: mobile ? '18px 12px' : '28px 20px', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ color: '#64748b', fontSize: 13, marginBottom: 10 }}>Home › {activeRes} › {activeLevel} › {activeSubject}</div>

        <div style={{ display: 'flex', gap: 12, background: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
          <img src='https://placehold.co/80x80/009688/ffffff?text=JD' alt='' style={{ width: 70, height: 70, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800 }}>Need help with {activeSubject}?</div>
            <div style={{ color: '#64748b' }}>1-to-1 tutoring with an experienced specialist · ✓ Qualified Teacher</div>
          </div>
          <button style={{ background: TEAL, color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8 }}>Book Tutor</button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Resource Type</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>{RES_TYPES.map(r => <button key={r} onClick={() => setActiveRes(r)} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: activeRes===r ? TEAL_DARK : '#e2e8f0', color: activeRes===r ? '#fff' : '#334155' }}>{r}</button>)}</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Level</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>{LEVELS.map(l => <button key={l} onClick={() => setActiveLevel(l)} style={{ padding: '6px 12px', borderRadius: 8, border: activeLevel===l ? `1px solid ${TEAL}` : '1px solid #cbd5e1', background: activeLevel===l ? '#ecfeff' : '#fff' }}>{l}</button>)}</div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Subject</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>{(LEVEL_SUBJECTS[activeLevel]||[]).map(s => <button key={s} onClick={() => setActiveSubject(s)} style={{ padding: '8px 12px', borderRadius: 20, background: activeSubject===s ? TEAL : '#e2e8f0', color: activeSubject===s ? '#fff' : '#334155' }}>{s}</button>)}</div>
        </div>

        <h3 style={{ marginTop: 0 }}>{activeLevel} {activeSubject} — {activeRes}{isVideos ? ' by Topic' : ' by Exam Board'}</h3>

        {loading ? <div style={{ color: '#94a3b8' }}>Loading…</div> : (
          isVideos ? (
            <div style={{ background: '#fff', borderRadius: 12, padding: 12 }}>
              {videoItems().length === 0 ? <div style={{ color: '#94a3b8' }}>Coming soon</div> : videoItems().map(v => (
                <div key={v.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button onClick={() => window.open(v.url,'_blank')} style={{ flex:1, padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'left' }}>{v.title}</button>
                  {isAdmin && <button onClick={() => deleteItem(v.id)} style={{ background:'#fee2e2', color:'#b91c1c', border:'none', padding:'8px 10px', borderRadius:8 }}>✕</button>}
                </div>
              ))}
              {isAdmin && <button onClick={() => addItem('')} style={{ marginTop: 8, padding: '10px', borderRadius: 8, border: `1px dashed ${TEAL}` }}>+ Add video topic</button>}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              { (LEVEL_BOARDS[activeLevel] || []).map(board => (
                <div key={board} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ background: TEAL_DARK, color: '#fff', padding: 12, fontWeight: 800 }}>{board}</div>
                  <div style={{ padding: 12 }}>
                    {itemsForBoard(board).length === 0 ? <div style={{ color: '#94a3b8' }}>Coming soon</div> : itemsForBoard(board).map(it => (
                      <div key={it.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <button onClick={() => window.open(it.url,'_blank')} style={{ flex:1, padding: '10px', borderRadius: 8, border:'1px solid #e2e8f0', background:'#f8fafc', textAlign:'left' }}>{it.title}</button>
                        {isAdmin && <button onClick={() => deleteItem(it.id)} style={{ background:'#fee2e2', color:'#b91c1c', border:'none', padding:'8px 10px', borderRadius:8 }}>✕</button>}
                      </div>
                    ))}
                    {isAdmin && <button onClick={() => addItem(board)} style={{ padding: '10px', borderRadius: 8, border: `1px dashed ${TEAL}` }}>+ Add resource</button>}
                  </div>
                </div>
              )) }
            </div>
          )
        )}
      </div>
    </section>
  );

  function addItem(board) { // local helpers using store
    const title = board ? prompt('Resource title:') : prompt('Video topic:');
    if (!title) return;
    const url = prompt('Paste URL:');
    if (!url) return;
    store.add({ res_type: board ? activeRes : 'Videos', subject: activeSubject, level: activeLevel, board: board || null, title, url });
    setResources(store.all());
  }
  function deleteItem(id) { if (!confirm('Delete?')) return; store.del(id); setResources(store.all()); }
}

function Booking() {
  const mobile = useIsMobile();
  const [form, setForm] = useState({ name:'', email:'', subject:'Physics', level:'GCSE/IGCSE', message:'' });
  const [sent, setSent] = useState(false);
  function setField(k,v){ setForm(f=>({...f,[k]:v})); }
  function submit(e){ e.preventDefault(); setSent(true); }
  return (
    <section style={{ background: `linear-gradient(135deg, ${TEAL_DARK}, ${TEAL})`, padding: mobile ? '28px 12px' : '44px 20px', color:'#fff' }}>
      <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns: mobile? '1fr' : '1fr 1fr', gap:20 }}>
        <div>
          <h3>Book a Tutoring Session</h3>
          <p>Personalised 1-to-1 lessons in Science and Maths — flexible online sessions.</p>
          <ul>
            <li>GCSE / 11+ / T-Level / BTEC — £35/hr</li>
            <li>A-Level — £40/hr</li>
          </ul>
        </div>
        <div style={{ background:'#fff', color:'#0f172a', padding:14, borderRadius:12 }}>
          {sent ? (
            <div style={{ textAlign:'center' }}><div style={{ fontSize:40 }}>✅</div><h4>Thanks, {form.name||'there'}!</h4><p>We'll reply to {form.email||'your email'} shortly.</p></div>
          ) : (
            <form onSubmit={submit} style={{ display:'grid', gap:8 }}>
              <input required placeholder='Your name' value={form.name} onChange={(e)=>setField('name',e.target.value)} style={{padding:10}} />
              <input required type='email' placeholder='Email' value={form.email} onChange={(e)=>setField('email',e.target.value)} style={{padding:10}} />
              <div style={{ display:'flex', gap:8 }}>
                <select value={form.level} onChange={(e)=>setField('level',e.target.value)} style={{padding:10}}>{LEVELS.map(l=> <option key={l}>{l}</option>)}</select>
                <input value={form.subject} onChange={(e)=>setField('subject',e.target.value)} placeholder='Subject' style={{padding:10}} />
              </div>
              <textarea placeholder='What would you like help with?' value={form.message} onChange={(e)=>setField('message',e.target.value)} rows={3} style={{padding:10}} />
              <button type='submit' style={{ background:TEAL, color:'#fff', padding:10, borderRadius:8, border:'none', fontWeight:800 }}>Request Session</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function BecomeTutor() {
  const mobile = useIsMobile();
  return (
    <section style={{ background:'#0f172a', color:'#fff', padding: mobile ? '28px 12px' : '44px 20px' }}>
      <div style={{ maxWidth:640, margin:'0 auto' }}>
        <h3>Become a Tutor</h3>
        <p>Submit your profile below and we'll review applications.</p>
        <form onSubmit={(e)=>{e.preventDefault(); alert('Form submitted (preview)');}} style={{ display:'grid', gap:8 }}>
          <input required placeholder='Full name' style={{padding:10}} />
          <input required placeholder='Email' style={{padding:10}} />
          <input placeholder='Phone' style={{padding:10}} />
          <input required placeholder='Subjects & levels you teach' style={{padding:10}} />
          <input required placeholder='Qualifications' style={{padding:10}} />
          <textarea required placeholder='Short bio' rows={4} style={{padding:10}} />
          <button type='submit' style={{ background:'#fbbf24', color:'#0f172a', padding:10, borderRadius:8, border:'none', fontWeight:800 }}>Submit Application</button>
        </form>
      </div>
    </section>
  );
}

function Contact() {
  const mobile = useIsMobile();
  return (
    <section style={{ padding: mobile ? '24px 12px' : '40px 20px', background:'#fff' }}>
      <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
        <h3>Get in touch</h3>
        <div style={{ display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap:12, marginTop:12 }}>
          <div style={{ background:'#f8fafc', padding:12, borderRadius:10 }}><div style={{fontWeight:800}}>Email</div><a href='mailto:info@jdscience.co.uk'>info@jdscience.co.uk</a></div>
          <div style={{ background:'#f8fafc', padding:12, borderRadius:10 }}><div style={{fontWeight:800}}>Phone</div><a href='tel:07466142805'>07466 142805</a></div>
        </div>
      </div>
    </section>
  );
}

function Footer(){
  return (
    <footer style={{ background:'#0f172a', color:'#cbd5e1', padding:'28px 18px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:16 }}>
        <div><div style={{ fontWeight:800, color:'#fff' }}>jdscience.co.uk</div><p style={{ marginTop:8 }}>Free science & maths resources and expert tutoring.</p></div>
        <div><div style={{ fontWeight:700, color:'#fff' }}>Resources</div>{RES_TYPES.map(r => <div key={r} style={{ marginTop:6 }}>{r}</div>)}</div>
        <div><div style={{ fontWeight:700, color:'#fff' }}>Contact</div><div style={{ marginTop:6 }}>✉ info@jdscience.co.uk</div><div style={{ marginTop:6 }}>☎ 07466 142805</div></div>
      </div>
      <div style={{ textAlign:'center', color:'#64748b', marginTop:18 }}>© {new Date().getFullYear()} jdscience.co.uk — All rights reserved.</div>
    </footer>
  );
}

function App(){
  const [page, setPage] = useState('home');
  const [pickedLevel, setPickedLevel] = useState(null);
  const [pickedSubject, setPickedSubject] = useState(null);
  const [pickedRes, setPickedRes] = useState(null);
  const [isAdmin, setIsAdmin] = useState(sessionStorage.getItem('jd_admin') === '1');
  const store = React.useRef(useMemoryStore([]));

  useEffect(()=>{ if(isAdmin) sessionStorage.setItem('jd_admin','1'); else sessionStorage.removeItem('jd_admin'); },[isAdmin]);

  const goHome = () => { setPage('home'); window.scrollTo({top:0, behavior:'smooth'}); };
  const goPapers = () => { setPage('papers'); window.scrollTo({top:0, behavior:'smooth'}); };

  const onPick = (lvl, subj) => { setPickedLevel(lvl); setPickedSubject(subj); goPapers(); };
  const onLevel = (lvl) => { setPickedLevel(lvl); setPickedSubject(LEVEL_SUBJECTS[lvl][0]); goPapers(); };
  const onResource = (r) => { setPickedRes(r); goPapers(); };
  const onScroll = (id) => { if (page !== 'home') { setPage('home'); setTimeout(()=>{ const el = document.getElementById(id+'-anchor'); if(el) el.scrollIntoView({behavior:'smooth'}); },120); } else { const el = document.getElementById(id+'-anchor'); if(el) el.scrollIntoView({behavior:'smooth'}); } };
  const onSearch = (q) => { alert('Search for: '+q+' (preview)'); };
  const toggleAdmin = () => {
    if(isAdmin){ setIsAdmin(false); } else {
      const pw = prompt('Admin password (preview):'); if(pw === 'jdscience2026'){ setIsAdmin(true); } else if(pw){ alert('Wrong password'); }
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', background:'#f8fafc', color:'#0f172a' }}>
      <Navbar onHome={goHome} onPick={onPick} onResource={onResource} onScroll={onScroll} onSearch={onSearch} isAdmin={isAdmin} toggleAdmin={toggleAdmin} />

      {page === 'home' && (
        <main>
          <Hero onBrowse={goPapers} onScroll={onScroll} />
          <div style={{ background:'#fff', borderBottom:'1px solid #eee', padding:'10px 16px' }}><div style={{ maxWidth:1100, margin:'0 auto', textAlign:'center', color:'#475569' }}>Covering: AQA · Edexcel · OCR · Eduqas · Pearson · NCFE</div></div>
          <LevelGrid onLevel={onLevel} />
          <div id='book-anchor'><Booking /></div>
          <div id='tutor-anchor'><BecomeTutor /></div>
          <div id='contact-anchor'><Contact /></div>
        </main>
      )}

      {page === 'papers' && (
        <main>
          <PastPapers initialLevel={pickedLevel} initialSubject={pickedSubject} initialRes={pickedRes} isAdmin={isAdmin} store={store.current} />
        </main>
      )}

      <Footer />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('artifact_react'));
