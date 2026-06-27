import React, { useState, useRef } from "react";
import { supabase } from "./supabaseClient";

const HERO_IMG = "https://cdn.abacus.ai/images/a3ac8de7-2ad2-4a64-bab2-8fbe6d17616e.png";
const CONTACT = { email:"info@jdscience.co.uk", phone:"07466142805" };
// 🔑 Paste your Stripe Payment Link here (Stripe Dashboard → Payment Links). Used as fallback if a tutor has no own link.
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_xxxxxxxxxxxx";
const inputStyle = { padding:"12px 14px", borderRadius:8, border:"1px solid #ddd", fontSize:".95rem", outline:"none", width:"100%", boxSizing:"border-box" };

// Topics drawn from AQA GCSE Combined Science spec
const subjects = [
  { icon:"⚛️", name:"Physics", bg:"linear-gradient(135deg,#1a0533,#4c1d95,#2d1060)", desc:"Master the fundamental laws of the universe — from energy and electricity to forces, waves and magnetism.", topics:["Energy","Electricity","Particle Model of Matter","Atomic Structure","Forces","Waves","Magnetism & Electromagnetism"] },
  { icon:"⚗️", name:"Chemistry", bg:"linear-gradient(135deg,#064e3b,#065f46,#047857)", desc:"Explore matter and its transformations — atomic structure, bonding, energy changes and organic chemistry.", topics:["Atomic Structure & Periodic Table","Bonding, Structure & Properties","Quantitative Chemistry","Chemical Changes","Energy Changes","Rate & Extent of Chemical Change","Organic Chemistry","Chemical Analysis","Chemistry of the Atmosphere","Using Resources"] },
  { icon:"🧬", name:"Biology", bg:"linear-gradient(135deg,#0c4a6e,#0369a1,#0284c7)", desc:"Understand the science of life — cells, organisation, infection, inheritance, evolution and ecology.", topics:["Cell Biology","Organisation","Infection & Response","Bioenergetics","Homeostasis & Response","Inheritance, Variation & Evolution","Ecology"] },
  { icon:"🧮", name:"Maths", bg:"linear-gradient(135deg,#1c1917,#292524,#44403c)", desc:"Build strong mathematical foundations — algebra, geometry, statistics and more.", topics:["Number","Algebra","Ratio & Proportion","Geometry & Measures","Probability","Statistics"] }
];

const whyCards = [
  { icon:"🎯", title:"Personalised Learning", desc:"Every session is tailored to the individual student's pace, gaps, and exam board requirements." },
  { icon:"🏆", title:"Experienced Tutors", desc:"Qualified science educators with thousands of hours of tutoring experience across all key stages." },
  { icon:"📈", title:"Proven Results", desc:"98% student satisfaction rate with consistently improved grades and boosted confidence." },
  { icon:"💻", title:"Flexible Sessions", desc:"Online and in-person options available to suit your schedule and learning preferences." },
  { icon:"📋", title:"All Exam Boards", desc:"Covering AQA, Edexcel, OCR, Eduqas, and iGCSE — no matter your school's curriculum." },
  { icon:"🤝", title:"Free Consultation", desc:"Start with a free no-obligation consultation to discuss your goals and find the right plan." }
];

const EXAM_BOARDS = ["AQA","Edexcel","OCR","Eduqas"];
const RES_SUBJECTS = ["Physics","Chemistry","Biology","Maths"];
const topicsFor = (subj) => (subjects.find(s => s.name===subj) || {}).topics || [];

const navMenu = [
  { label:"Home", id:"home" },
  { label:"11+", options:["English","Maths","Verbal Reasoning","Non-Verbal Reasoning"] },
  { label:"GCSE / IGCSE", options:["AQA","Edexcel","OCR","Eduqas"] },
  { label:"A-Level", options:["AQA","Edexcel","OCR","Eduqas"] },
  { label:"T-Levels", options:["Health & Science","Engineering","Digital","Education"] },
  { label:"BTEC", options:["Applied Science","Engineering","IT","Health & Social Care"] },
  { label:"Resources", resource:true, options:["Revision Notes","Past Questions","Videos"] },
  { label:"Tutors", id:"tutors" },
  { label:"Contact", id:"contact" }
];

const scrollTo = (id) => { const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:"smooth"}); };

// ── Booking Modal (with Stripe payment) ─────────────────────
function BookingModal({ onClose, tutor }) {
  const [form, setForm] = useState({ name:"", email:"", subject:"Physics", message:"" });
  const proceedToPay = (e) => {
    e.preventDefault();
    const link = (tutor && tutor.payment_link) || STRIPE_PAYMENT_LINK;
    // pass details to Stripe via prefilled email + client_reference_id
    const url = `${link}${link.includes("?")?"&":"?"}prefilled_email=${encodeURIComponent(form.email)}&client_reference_id=${encodeURIComponent(form.name + " | " + form.subject + (tutor?(" | Tutor: "+tutor.name):""))}`;
    window.open(url, "_blank");
  };
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,padding:36,maxWidth:480,width:"100%",position:"relative",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
        <button onClick={onClose} style={{position:"absolute",top:16,right:18,background:"none",border:"none",fontSize:"1.4rem",cursor:"pointer",color:"#888"}}>✕</button>
        <h2 style={{fontSize:"1.5rem",fontWeight:800,marginBottom:6}}>{tutor ? `Book ${tutor.name}` : "Book a Session"}</h2>
        <p style={{color:"#666",fontSize:".9rem",marginBottom:20}}>Enter your details, then continue to secure payment.</p>
        <form onSubmit={proceedToPay} style={{display:"flex",flexDirection:"column",gap:14}}>
          <input required name="name" placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inputStyle} />
          <input required type="email" name="email" placeholder="Your email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inputStyle} />
          <select name="subject" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} style={inputStyle}>
            {subjects.map(s => <option key={s.name}>{s.name}</option>)}
          </select>
          <textarea name="message" placeholder="Tell us about your goals..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={3} style={{...inputStyle,resize:"vertical"}} />
          <button type="submit" style={{background:"#635bff",color:"#fff",border:"none",padding:"14px",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:"1rem"}}>💳 Continue to Payment</button>
          <p style={{fontSize:".75rem",color:"#999",textAlign:"center"}}>Secure payment powered by Stripe</p>
        </form>
      </div>
    </div>
  );
}

// ── Navbar ──────────────────────────────────────────────────
function Navbar({ onSearch, onBook, onOpenResource, isAdmin }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const submit = (e) => { e.preventDefault(); onSearch(q); };
  const handleAuth = async () => {
    if (isAdmin) { await supabase.auth.signOut(); return; }
    const email = window.prompt("Admin email:"); if (!email) return;
    const password = window.prompt("Admin password:"); if (!password) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login failed: " + error.message);
  };
  return (
    <nav style={{background:"#fff",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 6px rgba(0,0,0,.08)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 40px",flexWrap:"wrap",gap:12}}>
        <div onClick={() => { onOpenResource(null); scrollTo("home"); }} style={{display:"flex",alignItems:"center",gap:10,fontSize:"1.4rem",fontWeight:800,color:"#7c3aed",cursor:"pointer"}}>
          <div style={{width:38,height:38,background:"linear-gradient(135deg,#7c3aed,#06b6d4)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:".9rem"}}>JD</div>
          JDScience
        </div>
        <form onSubmit={submit} style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center",background:"#f3f4f6",borderRadius:8,padding:"8px 14px",gap:8,border:"1px solid #e5e7eb"}}>
            <span>🔍</span>
            <input type="text" placeholder="Search subjects, topics..." value={q} onChange={e=>setQ(e.target.value)} style={{border:"none",background:"transparent",outline:"none",fontSize:".9rem",width:160,color:"#333"}} />
          </div>
          <button type="submit" style={{background:"#7c3aed",color:"#fff",border:"none",padding:"10px 16px",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:".85rem"}}>Search</button>
          <button type="button" onClick={onBook} style={{background:"#06b6d4",color:"#fff",border:"none",padding:"10px 18px",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:".85rem"}}>Book a Session</button>
          <button type="button" onClick={handleAuth} title="Admin login" style={{background: isAdmin ? "#16a34a" : "#e5e7eb", color: isAdmin ? "#fff" : "#555", border:"none", padding:"10px 14px", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:".8rem"}}>{isAdmin ? "✓ Logout" : "Admin"}</button>
        </form>
      </div>
      <div style={{background:"#2dd4bf",display:"flex",justifyContent:"center",flexWrap:"wrap"}}>
        {navMenu.map((item,i) => (
          <div key={item.label} onMouseEnter={() => setOpen(item.options?i:null)} onMouseLeave={() => setOpen(null)} style={{position:"relative"}}>
            <button onClick={() => item.id && scrollTo(item.id)}
              style={{background: open===i?"#1f2937":"transparent",border:"none",borderRight:"1px solid rgba(0,0,0,.1)",padding:"14px 22px",fontWeight:700,fontSize:".85rem",letterSpacing:".5px",cursor:"pointer",color: open===i?"#fff":"#1f2937"}}>
              {item.label.toUpperCase()}{item.options ? " ▾" : ""}
            </button>
            {item.options && open===i && (
              <div style={{position:"absolute",top:"100%",left:0,background:"#1f2937",minWidth:200,boxShadow:"0 10px 30px rgba(0,0,0,.25)",zIndex:200}}>
                {item.options.map(opt => (
                  <a key={opt} onClick={() => item.resource ? onOpenResource(opt) : scrollTo("resources")}
                    style={{display:"block",padding:"12px 20px",color:"#e5e7eb",fontSize:".88rem",textDecoration:"none",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,.06)"}}
                    onMouseEnter={e => e.currentTarget.style.background="#374151"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>{opt}</a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

// ── Resource Browser: Revision Notes / Past Questions (files) ──
function ResourceBrowser({ type, onClose, isAdmin }) {
  const isNotes = type === "Revision Notes";
  const accent = isNotes ? "#0284c7" : "#7c3aed";
  const icon = isNotes ? "📚" : "📝";
  const [subject, setSubject] = useState(null);
  const [board, setBoard] = useState(null);
  const [topic, setTopic] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const folder = isNotes ? `notes/${subject}/${board}/${topic}` : `past/${subject}/${board}`;
  const showFiles = isNotes ? (subject && board && topic) : (subject && board);

  const loadFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from("resources").list(folder, { sortBy: { column: "name", order: "asc" } });
    if (!error && data) {
      setFiles(data.filter(f => f.name !== ".emptyFolderPlaceholder").map(f => {
        const { data: pub } = supabase.storage.from("resources").getPublicUrl(`${folder}/${f.name}`);
        return { name: f.name, url: pub.publicUrl };
      }));
    } else setFiles([]);
    setLoading(false);
  };
  React.useEffect(() => { if (showFiles) loadFiles(); /* eslint-disable-next-line */ }, [folder, showFiles]);

  const upload = async (e) => {
    const list = Array.from(e.target.files); setLoading(true);
    for (const f of list) { const { error } = await supabase.storage.from("resources").upload(`${folder}/${f.name}`, f, { upsert: true }); if (error) alert("Upload failed: " + error.message); }
    e.target.value = ""; await loadFiles();
  };
  const remove = async (name) => { await supabase.storage.from("resources").remove([`${folder}/${name}`]); await loadFiles(); };

  const Crumb = () => (
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",fontSize:".9rem",marginBottom:24}}>
      <span onClick={() => { setSubject(null); setBoard(null); setTopic(null); }} style={{cursor:"pointer",color:accent,fontWeight:700}}>{icon} {type}</span>
      {subject && <><span style={{color:"#bbb"}}>/</span><span onClick={() => { setBoard(null); setTopic(null); }} style={{cursor:"pointer",color:accent,fontWeight:600}}>{subject}</span></>}
      {board && <><span style={{color:"#bbb"}}>/</span><span onClick={() => setTopic(null)} style={{cursor:"pointer",color:accent,fontWeight:600}}>{board}</span></>}
      {topic && <><span style={{color:"#bbb"}}>/</span><span style={{color:"#555",fontWeight:600}}>{topic}</span></>}
    </div>
  );
  const Tile = ({ label, sub, onClick }) => (
    <button onClick={onClick} style={{textAlign:"left",background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"22px 24px",cursor:"pointer",boxShadow:"0 2px 10px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:"1.05rem",fontWeight:800,color:accent}}>{label}</div>
      {sub && <div style={{color:"#888",fontSize:".82rem",marginTop:4}}>{sub}</div>}
    </button>
  );
  const grid = { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16 };

  return (
    <section style={{minHeight:"70vh",padding:"50px 40px",background:"#f9fafb"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <h2 style={{fontSize:"2rem",fontWeight:800}}>{icon} {type}</h2>
          <button onClick={onClose} style={{background:"#fff",border:"1px solid #e5e7eb",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontWeight:600}}>← Back to Home</button>
        </div>
        <p style={{color:"#666",marginBottom:24}}>{isNotes ? "Browse revision notes by subject, exam board and topic." : "Browse past questions by subject and exam board."}</p>
        <Crumb />
        {!subject && <div style={grid}>{RES_SUBJECTS.map(s => <Tile key={s} label={s} sub="Select subject" onClick={() => setSubject(s)} />)}</div>}
        {subject && !board && <div style={grid}>{EXAM_BOARDS.map(b => <Tile key={b} label={b} sub="Select exam board" onClick={() => setBoard(b)} />)}</div>}
        {isNotes && subject && board && !topic && <div style={grid}>{topicsFor(subject).map(t => <Tile key={t} label={t} sub="View notes" onClick={() => setTopic(t)} />)}</div>}
        {showFiles && (
          <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:28}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
              <h3 style={{fontSize:"1.1rem",fontWeight:800,color:accent}}>{icon} {subject} · {board}{topic?` · ${topic}`:""}</h3>
              {isAdmin && (<><button onClick={() => inputRef.current.click()} style={{background:accent,color:"#fff",border:"none",padding:"10px 18px",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:".85rem"}}>＋ Upload</button><input ref={inputRef} type="file" multiple onChange={upload} style={{display:"none"}} /></>)}
            </div>
            {loading ? <div style={{textAlign:"center",padding:"36px 0",color:"#999"}}>Loading…</div>
            : files.length===0 ? (
              <div style={{textAlign:"center",padding:"36px 0",color:"#999",border:"2px dashed #e5e7eb",borderRadius:12}}>
                <div style={{fontSize:"2.2rem",marginBottom:8}}>{icon}</div>
                <p style={{fontWeight:600}}>{isAdmin ? "Nothing uploaded here yet." : "No files available here yet."}</p>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {files.map((f) => (
                  <div key={f.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#f9fafb",borderRadius:10,padding:"12px 16px",border:"1px solid #eee"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:"1.3rem"}}>📄</span><p style={{fontWeight:600,fontSize:".92rem"}}>{f.name}</p></div>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <a href={f.url} target="_blank" rel="noreferrer" style={{color:accent,fontWeight:600,fontSize:".82rem",textDecoration:"none"}}>View</a>
                      <a href={f.url} download style={{color:"#06b6d4",fontWeight:600,fontSize:".82rem",textDecoration:"none"}}>Download</a>
                      {isAdmin && <button onClick={() => remove(f.name)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontWeight:700}}>✕</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Video Resources: videos arranged by subject → topic ─────
function VideoBrowser({ onClose, isAdmin }) {
  const accent = "#dc2626";
  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const toEmbed = (url) => { const m=url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/); return m?`https://www.youtube.com/embed/${m[1]}`:url; };

  const loadVideos = async () => {
    setLoading(true);
    const { data } = await supabase.from("videos").select("*").eq("subject",subject).eq("topic",topic).order("created_at",{ascending:false});
    setVideos(data || []); setLoading(false);
  };
  React.useEffect(() => { if (subject && topic) loadVideos(); /* eslint-disable-next-line */ }, [subject, topic]);

  const addVideo = async () => {
    const title = window.prompt("Video title:"); if (!title) return;
    const url = window.prompt("YouTube link:"); if (!url) return;
    const { error } = await supabase.from("videos").insert({ subject, topic, title, url: toEmbed(url) });
    if (error) alert("Failed: " + error.message); else loadVideos();
  };
  const delVideo = async (id) => { await supabase.from("videos").delete().eq("id",id); loadVideos(); };

  const Crumb = () => (
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",fontSize:".9rem",marginBottom:24}}>
      <span onClick={() => { setSubject(null); setTopic(null); }} style={{cursor:"pointer",color:accent,fontWeight:700}}>🎬 Videos</span>
      {subject && <><span style={{color:"#bbb"}}>/</span><span onClick={() => setTopic(null)} style={{cursor:"pointer",color:accent,fontWeight:600}}>{subject}</span></>}
      {topic && <><span style={{color:"#bbb"}}>/</span><span style={{color:"#555",fontWeight:600}}>{topic}</span></>}
    </div>
  );
  const Tile = ({ label, sub, onClick }) => (
    <button onClick={onClick} style={{textAlign:"left",background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"22px 24px",cursor:"pointer",boxShadow:"0 2px 10px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:"1.05rem",fontWeight:800,color:accent}}>{label}</div>
      {sub && <div style={{color:"#888",fontSize:".82rem",marginTop:4}}>{sub}</div>}
    </button>
  );
  const grid = { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16 };

  return (
    <section style={{minHeight:"70vh",padding:"50px 40px",background:"#f9fafb"}}>
      <div style={{maxWidth:1000,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <h2 style={{fontSize:"2rem",fontWeight:800}}>🎬 Video Lessons</h2>
          <button onClick={onClose} style={{background:"#fff",border:"1px solid #e5e7eb",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontWeight:600}}>← Back to Home</button>
        </div>
        <p style={{color:"#666",marginBottom:24}}>Watch topic-by-topic video lessons, organised by subject.</p>
        <Crumb />
        {!subject && <div style={grid}>{RES_SUBJECTS.map(s => <Tile key={s} label={s} sub="Select subject" onClick={() => setSubject(s)} />)}</div>}
        {subject && !topic && <div style={grid}>{topicsFor(subject).map(t => <Tile key={t} label={t} sub="Watch videos" onClick={() => setTopic(t)} />)}</div>}
        {subject && topic && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
              <h3 style={{fontSize:"1.1rem",fontWeight:800,color:accent}}>🎬 {subject} · {topic}</h3>
              {isAdmin && <button onClick={addVideo} style={{background:accent,color:"#fff",border:"none",padding:"10px 18px",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:".85rem"}}>＋ Add Video</button>}
            </div>
            {loading ? <div style={{textAlign:"center",padding:"36px 0",color:"#999"}}>Loading…</div>
            : videos.length===0 ? (
              <div style={{textAlign:"center",padding:"36px 0",color:"#999",border:"2px dashed #e5e7eb",borderRadius:12}}>
                <div style={{fontSize:"2.2rem",marginBottom:8}}>🎬</div>
                <p style={{fontWeight:600}}>{isAdmin ? "No videos here yet. Click \"Add Video\"." : "No videos available here yet."}</p>
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20}}>
                {videos.map(v => (
                  <div key={v.id} style={{background:"#fff",borderRadius:14,overflow:"hidden",border:"1px solid #e5e7eb"}}>
                    <div style={{position:"relative",paddingTop:"56.25%"}}><iframe src={v.url} title={v.title} allowFullScreen style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}} /></div>
                    <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                      <p style={{fontWeight:600,fontSize:".9rem"}}>{v.title}</p>
                      {isAdmin && <button onClick={() => delVideo(v.id)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontWeight:700}}>✕</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Tutors ──────────────────────────────────────────────────
function Tutors({ isAdmin, onBookTutor }) {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { const { data } = await supabase.from("tutors").select("*").order("created_at",{ascending:true}); setTutors(data || []); setLoading(false); };
  React.useEffect(() => { load(); }, []);

  const addTutor = async () => {
    const name = window.prompt("Tutor name:"); if (!name) return;
    const subject = window.prompt("Subject(s) (e.g. Physics, Maths):") || "";
    const bio = window.prompt("Short bio:") || "";
    const rate = window.prompt("Rate (e.g. £35/hr):") || "";
    const photo = window.prompt("Photo URL (optional):") || "";
    const payment_link = window.prompt("Stripe payment link for this tutor (optional — leave blank to use default):") || "";
    const { error } = await supabase.from("tutors").insert({ name, subject, bio, rate, photo, payment_link });
    if (error) alert("Failed: " + error.message); else load();
  };
  const delTutor = async (id) => { await supabase.from("tutors").delete().eq("id",id); load(); };

  return (
    <section id="tutors" style={{padding:"80px 40px",background:"#faf5ff"}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <h2 style={{fontSize:"2.2rem",fontWeight:800}}>Meet Our <span style={{color:"#7c3aed"}}>Tutors</span></h2>
        <p style={{color:"#666",marginTop:10}}>Read their profiles and book the tutor that's right for you.</p>
        {isAdmin && <button onClick={addTutor} style={{marginTop:16,background:"#7c3aed",color:"#fff",border:"none",padding:"10px 20px",borderRadius:8,fontWeight:600,cursor:"pointer"}}>＋ Add Tutor</button>}
      </div>
      {loading ? <p style={{textAlign:"center",color:"#999"}}>Loading…</p>
      : tutors.length===0 ? <p style={{textAlign:"center",color:"#999"}}>No tutor profiles yet{isAdmin?" — add one above.":"."}</p>
      : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:24,maxWidth:1100,margin:"0 auto"}}>
          {tutors.map(t => (
            <div key={t.id} style={{background:"#fff",borderRadius:16,overflow:"hidden",border:"1px solid #e5e7eb",boxShadow:"0 4px 16px rgba(0,0,0,.05)"}}>
              <div style={{height:160,background:t.photo?`url(${t.photo}) center/cover`:"linear-gradient(135deg,#7c3aed,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center"}}>{!t.photo && <span style={{fontSize:"3rem",color:"#fff"}}>�toContain</span>}</div>
              <div style={{padding:"18px 20px"}}>
                <h3 style={{fontSize:"1.15rem",fontWeight:800}}>{t.name}</h3>
                <p style={{color:"#7c3aed",fontWeight:600,fontSize:".88rem",margin:"2px 0 10px"}}>{t.subject}{t.rate?` · ${t.rate}`:""}</p>
                <p style={{color:"#555",fontSize:".88rem",lineHeight:1.6,marginBottom:16}}>{t.bio}</p>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <button onClick={() => onBookTutor(t)} style={{flex:1,background:"#635bff",color:"#fff",border:"none",padding:"10px",borderRadius:8,fontWeight:700,cursor:"pointer"}}>💳 Book {t.name.split(" ")[0]}</button>
                  {isAdmin && <button onClick={() => delTutor(t.id)} style={{background:"none",border:"1px solid #eee",color:"#ef4444",cursor:"pointer",fontWeight:700,borderRadius:8,padding:"10px 12px"}}>✕</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Search Results ──────────────────────────────────────────
function SearchResults({ query, onClose }) {
  const results = subjects.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.desc.toLowerCase().includes(query.toLowerCase()) || s.topics.some(t=>t.toLowerCase().includes(query.toLowerCase())));
  return (
    <div style={{background:"#f9fafb",padding:"40px",borderBottom:"1px solid #e5e7eb"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div><h2 style={{fontSize:"1.5rem",fontWeight:800}}>Results for "<span style={{color:"#7c3aed"}}>{query}</span>"</h2><p style={{color:"#666",fontSize:".9rem",marginTop:4}}>{results.length} result{results.length!==1?"s":""} found</p></div>
          <button onClick={onClose} style={{background:"#fff",border:"1px solid #e5e7eb",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontWeight:600}}>✕ Clear</button>
        </div>
        {results.length===0 ? (
          <div style={{textAlign:"center",padding:40,color:"#888"}}><div style={{fontSize:"3rem",marginBottom:12}}>🔍</div><p style={{fontSize:"1.1rem",fontWeight:600}}>No results for "{query}"</p></div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:20}}>
            {results.map(s => (
              <div key={s.name} style={{background:"#fff",borderRadius:16,overflow:"hidden",border:"1px solid #e5e7eb"}}>
                <div style={{height:80,background:s.bg,display:"flex",alignItems:"center",padding:"0 20px",gap:12}}><span style={{fontSize:"1.8rem"}}>{s.icon}</span><span style={{color:"#fff",fontWeight:700,fontSize:"1.1rem"}}>{s.name}</span></div>
                <div style={{padding:"16px 20px"}}><p style={{color:"#555",fontSize:".9rem",lineHeight:1.6,marginBottom:12}}>{s.desc}</p><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{s.topics.map(t => <span key={t} style={{background:"#f3e8ff",color:"#7c3aed",fontSize:".78rem",padding:"3px 10px",borderRadius:20,fontWeight:500}}>{t}</span>)}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────
function Hero({ onBook }) {
  return (
    <section id="home" style={{background:"linear-gradient(135deg,#1a0533 0%,#2d1060 50%,#0f2557 100%)",padding:"60px 40px"}}>
      <div style={{maxWidth:1150,margin:"0 auto",display:"grid",gridTemplateColumns:"1.1fr 1fr",gap:50,alignItems:"center"}}>
        <div>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.1)",color:"#fff",padding:"8px 16px",borderRadius:50,fontSize:".85rem",marginBottom:24,border:"1px solid rgba(255,255,255,.15)"}}>🏆 Expert Science & Maths Tutoring</div>
          <h1 style={{fontSize:"3.2rem",fontWeight:900,color:"#fff",lineHeight:1.1,marginBottom:22}}>Learn <span style={{color:"#a78bfa"}}>Smarter</span>.<br/>Revise <span style={{color:"#2dd4bf"}}>Better</span>.<br/>Achieve <span style={{color:"#fbbf24"}}>More</span>.</h1>
          <p style={{color:"rgba(255,255,255,.8)",fontSize:"1.05rem",lineHeight:1.7,marginBottom:30}}>Personalised tutoring for 11+, GCSE, A-Level, T-Levels and BTEC. Supporting students of every background to reach their full potential.</p>
          <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:30}}>
            <button onClick={() => scrollTo("subjects")} style={{background:"rgba(255,255,255,.15)",color:"#fff",padding:"14px 26px",borderRadius:10,border:"1px solid rgba(255,255,255,.25)",fontWeight:600,fontSize:"1rem",cursor:"pointer"}}>Explore Subjects</button>
            <button onClick={onBook} style={{background:"#fff",color:"#7c3aed",padding:"14px 26px",borderRadius:10,border:"none",fontWeight:700,fontSize:"1rem",cursor:"pointer"}}>Book a Session</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}><span style={{color:"rgba(255,255,255,.6)",fontSize:".85rem"}}>Exam Boards:</span>{["AQA","Edexcel","OCR","Eduqas","iGCSE"].map(b => <span key={b} style={{color:"rgba(255,255,255,.85)",fontSize:".9rem",fontWeight:600}}>{b}</span>)}</div>
        </div>
        <div style={{borderRadius:20,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}><img src={HERO_IMG} alt="Diverse students learning together" style={{width:"100%",display:"block"}} /></div>
      </div>
    </section>
  );
}

// ── Subjects ────────────────────────────────────────────────
function Subjects({ onOpenResource }) {
  return (
    <section id="subjects" style={{padding:"80px 40px"}}>
      <div style={{textAlign:"center",marginBottom:48}}><h2 style={{fontSize:"2.2rem",fontWeight:800}}>Subjects We <span style={{color:"#7c3aed"}}>Offer</span></h2><p style={{color:"#666",fontSize:"1rem",marginTop:10,maxWidth:520,margin:"10px auto 0"}}>Expert tutoring across core science and maths subjects, tailored to your curriculum.</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:24,maxWidth:900,margin:"0 auto"}}>
        {subjects.map(s => (
          <div key={s.name} style={{borderRadius:16,overflow:"hidden",border:"1px solid #e5e7eb"}}>
            <div style={{height:200,background:s.bg,position:"relative",display:"flex",alignItems:"flex-end",padding:14}}>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"4rem",opacity:.4}}>{s.icon}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,color:"#fff",fontWeight:700,fontSize:"1.1rem",position:"relative",zIndex:1}}><div style={{width:36,height:36,background:"rgba(255,255,255,.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>{s.icon}</div>{s.name}</div>
            </div>
            <div style={{padding:"18px 20px 22px"}}><p style={{color:"#555",fontSize:".93rem",lineHeight:1.6,marginBottom:14}}>{s.desc}</p><a onClick={() => onOpenResource("Revision Notes")} style={{color:"#7c3aed",fontWeight:600,fontSize:".9rem",textDecoration:"none",cursor:"pointer"}}>View resources →</a></div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Why Us ──────────────────────────────────────────────────
function WhyUs() {
  return (
    <section id="why" style={{background:"#fff",padding:"80px 40px"}}>
      <div style={{textAlign:"center",marginBottom:48}}><h2 style={{fontSize:"2.2rem",fontWeight:800}}>Why Choose <span style={{color:"#7c3aed"}}>JDScience</span>?</h2><p style={{color:"#666",marginTop:10}}>We go beyond textbooks to deliver real understanding and lasting results.</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:28,maxWidth:1000,margin:"0 auto"}}>
        {whyCards.map(c => (
          <div key={c.title} style={{background:"#faf5ff",borderRadius:16,padding:28,border:"1px solid #eee"}}><div style={{width:48,height:48,background:"#f3e8ff",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",marginBottom:16}}>{c.icon}</div><h3 style={{fontSize:"1.05rem",fontWeight:700,marginBottom:8}}>{c.title}</h3><p style={{color:"#666",fontSize:".9rem",lineHeight:1.6}}>{c.desc}</p></div>
        ))}
      </div>
    </section>
  );
}

// ── Contact ─────────────────────────────────────────────────
function Contact() {
  const [form, setForm] = useState({ name:"", email:"", phone:"", subject:"Physics", message:"" });
  const [sent, setSent] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const body = `Name: ${form.name}%0D%0AEmail: ${form.email}%0D%0APhone: ${form.phone}%0D%0ASubject: ${form.subject}%0D%0A%0D%0A${form.message}`;
    window.location.href = `mailto:${CONTACT.email}?subject=Enquiry from ${form.name} - ${form.subject}&body=${body}`;
    setSent(true);
  };
  return (
    <section id="contact" style={{padding:"80px 40px",background:"#fff"}}>
      <div style={{textAlign:"center",marginBottom:48}}><h2 style={{fontSize:"2.2rem",fontWeight:800}}>Get In <span style={{color:"#7c3aed"}}>Touch</span></h2><p style={{color:"#666",marginTop:10}}>Send us your request and we'll respond as soon as possible.</p></div>
      <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1.3fr",gap:40,alignItems:"start"}}>
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div style={{display:"flex",alignItems:"center",gap:14,background:"#faf5ff",padding:"18px 20px",borderRadius:12}}><div style={{width:44,height:44,background:"#7c3aed",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem"}}>✉️</div><div><p style={{fontSize:".8rem",color:"#888",fontWeight:600}}>EMAIL</p><a href={`mailto:${CONTACT.email}`} style={{color:"#7c3aed",fontWeight:700,textDecoration:"none"}}>{CONTACT.email}</a></div></div>
          <div style={{display:"flex",alignItems:"center",gap:14,background:"#faf5ff",padding:"18px 20px",borderRadius:12}}><div style={{width:44,height:44,background:"#06b6d4",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem"}}>📞</div><div><p style={{fontSize:".8rem",color:"#888",fontWeight:600}}>PHONE</p><a href={`tel:${CONTACT.phone}`} style={{color:"#06b6d4",fontWeight:700,textDecoration:"none"}}>{CONTACT.phone}</a></div></div>
          <p style={{color:"#666",fontSize:".9rem",lineHeight:1.6}}>Prefer to talk? Call or email us directly, or fill in the form and we'll get back to you.</p>
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:32,border:"1px solid #e5e7eb",boxShadow:"0 8px 30px rgba(0,0,0,.06)"}}>
          {sent ? (
            <div style={{textAlign:"center",padding:"30px 0"}}><div style={{fontSize:"3rem",marginBottom:12}}>✅</div><h3 style={{fontSize:"1.3rem",fontWeight:800,marginBottom:8}}>Message Ready!</h3><p style={{color:"#666"}}>Your email client should have opened. We'll reply soon.</p><button onClick={() => setSent(false)} style={{marginTop:20,background:"#7c3aed",color:"#fff",border:"none",padding:"12px 28px",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Send Another</button></div>
          ) : (
            <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
              <input required name="name" placeholder="Your name" value={form.name} onChange={change} style={inputStyle} />
              <input required type="email" name="email" placeholder="Your email" value={form.email} onChange={change} style={inputStyle} />
              <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={change} style={inputStyle} />
              <select name="subject" value={form.subject} onChange={change} style={inputStyle}>{subjects.map(s => <option key={s.name}>{s.name}</option>)}<option>General Enquiry</option></select>
              <textarea required name="message" placeholder="Your request — tell us what you need help with..." value={form.message} onChange={change} rows={5} style={{...inputStyle,resize:"vertical"}} />
              <button type="submit" style={{background:"#7c3aed",color:"#fff",border:"none",padding:"14px",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:"1rem"}}>Send Request</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ── CTA & Footer ────────────────────────────────────────────
function CTA({ onBook }) {
  return (
    <section style={{background:"linear-gradient(135deg,#1a0533,#2d1060)",padding:"80px 40px",textAlign:"center"}}>
      <h2 style={{color:"#fff",fontSize:"2.2rem",fontWeight:800,marginBottom:16}}>Ready to Achieve More?</h2>
      <p style={{color:"rgba(255,255,255,.75)",fontSize:"1rem",maxWidth:480,margin:"0 auto 28px"}}>Book your session today and take the first step towards better grades.</p>
      <button onClick={onBook} style={{background:"#fff",color:"#7c3aed",border:"none",padding:"14px 32px",borderRadius:10,fontWeight:700,fontSize:"1rem",cursor:"pointer"}}>Book a Session</button>
    </section>
  );
}
function Footer() {
  return (
    <footer style={{padding:"32px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #e5e7eb",flexWrap:"wrap",gap:16}}>
      <div style={{fontWeight:800,color:"#7c3aed",fontSize:"1.1rem"}}>JDScience</div>
      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}><a href={`mailto:${CONTACT.email}`} style={{color:"#888",fontSize:".85rem",textDecoration:"none"}}>{CONTACT.email}</a><a href={`tel:${CONTACT.phone}`} style={{color:"#888",fontSize:".85rem",textDecoration:"none"}}>{CONTACT.phone}</a></div>
      <p style={{color:"#888",fontSize:".85rem"}}>© 2025 JDScience. All rights reserved.</p>
    </footer>
  );
}

// ── App ─────────────────────────────────────────────────────
function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingTutor, setBookingTutor] = useState(undefined); // undefined = closed, null = generic, object = tutor
  const [resourceView, setResourceView] = useState(null);
  const [session, setSession] = useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  const isAdmin = !!session;
  const openResource = (type) => { setSearchQuery(""); setResourceView(type); window.scrollTo({top:0,behavior:"smooth"}); };
  const openBooking = (tutor=null) => setBookingTutor(tutor);

  return (
    <div style={{fontFamily:"'Inter',sans-serif",color:"#111",background:"#fff"}}>
      <Navbar onSearch={(q)=>{setResourceView(null);setSearchQuery(q);}} onBook={() => openBooking(null)} onOpenResource={openResource} isAdmin={isAdmin} />
      {resourceView === "Videos" ? (
        <VideoBrowser onClose={() => setResourceView(null)} isAdmin={isAdmin} />
      ) : resourceView ? (
        <ResourceBrowser type={resourceView} onClose={() => setResourceView(null)} isAdmin={isAdmin} />
      ) : searchQuery ? (
        <SearchResults query={searchQuery} onClose={() => setSearchQuery("")} />
      ) : (
        <>
          <Hero onBook={() => openBooking(null)} />
          <Subjects onOpenResource={openResource} />
          <Tutors isAdmin={isAdmin} onBookTutor={(t) => openBooking(t)} />
          <WhyUs />
          <Contact />
          <CTA onBook={() => openBooking(null)} />
        </>
      )}
      <Footer />
      {bookingTutor !== undefined && <BookingModal tutor={bookingTutor} onClose={() => setBookingTutor(undefined)} />}
    </div>
  );
}

export default App;
