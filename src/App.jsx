import React, { useState, useRef } from "react";

const subjects = [
  { icon:"⚛️", name:"Physics", bg:"linear-gradient(135deg,#1a0533,#4c1d95,#2d1060)", desc:"Master the fundamental laws of the universe. From mechanics to quantum physics, build a strong conceptual and exam-ready foundation.", topics:["Mechanics","Waves","Electricity","Magnetism","Quantum Physics","Nuclear Physics"] },
  { icon:"⚗️", name:"Chemistry", bg:"linear-gradient(135deg,#064e3b,#065f46,#047857)", desc:"Explore the science of matter and its transformations. From organic reactions to atomic structure, master every topic with confidence.", topics:["Organic Chemistry","Atomic Structure","Bonding","Energetics","Kinetics","Electrochemistry"] },
  { icon:"🧬", name:"Biology", bg:"linear-gradient(135deg,#0c4a6e,#0369a1,#0284c7)", desc:"Understand the science of life. From cells and genetics to ecology and evolution, develop a deep understanding of living systems.", topics:["Cell Biology","Genetics","Ecology","Evolution","Physiology","Microbiology"] },
  { icon:"🧮", name:"Maths", bg:"linear-gradient(135deg,#1c1917,#292524,#44403c)", desc:"Build strong mathematical foundations. From algebra and geometry to calculus and statistics, develop fluency and exam technique.", topics:["Algebra","Calculus","Statistics","Geometry","Trigonometry","Mechanics"] },
  { icon:"📖", name:"A-Level", bg:"linear-gradient(135deg,#312e81,#4338ca,#6366f1)", desc:"In-depth A-Level tutoring for top grades in Science and Maths. Expert support for AS and A2 content across all major exam boards.", topics:["AS Level","A2 Level","AQA","Edexcel","OCR","WJEC"] },
  { icon:"🎓", name:"T-Levels", bg:"linear-gradient(135deg,#78350f,#92400e,#b45309)", desc:"Expert support for T-Level Science qualifications. Combining classroom theory with practical application for a complete learning experience.", topics:["Health Science","Engineering","Digital","Education","Construction","Science"] }
];

const whyCards = [
  { icon:"🎯", title:"Personalised Learning", desc:"Every session is tailored to the individual student's pace, gaps, and exam board requirements." },
  { icon:"🏆", title:"Experienced Tutor", desc:"Qualified science educator with 5000+ hours of tutoring experience across GCSE, A-Level, and T-Levels." },
  { icon:"📈", title:"Proven Results", desc:"98% student satisfaction rate with consistently improved grades and boosted confidence." },
  { icon:"💻", title:"Flexible Sessions", desc:"Online and in-person options available to suit your schedule and learning preferences." },
  { icon:"📋", title:"All Exam Boards", desc:"Covering AQA, Edexcel, OCR, WJEC, and iGCSE — no matter your school's curriculum." },
  { icon:"🤝", title:"Free Consultation", desc:"Start with a free no-obligation consultation to discuss your goals and find the right plan." }
];

const CONTACT = { email:"info@jdscience.co.uk", phone:"07466142805" };

const inputStyle = { padding:"12px 14px", borderRadius:8, border:"1px solid #ddd", fontSize:".95rem", outline:"none", width:"100%", boxSizing:"border-box" };

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior:"smooth" });
};

// ── Booking Modal ──────────────────────────────────────────
function BookingModal({ onClose }) {
  const [form, setForm] = useState({ name:"", email:"", subject:"Physics", message:"" });
  const [sent, setSent] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const body = `Name: ${form.name}%0D%0AEmail: ${form.email}%0D%0ASubject: ${form.subject}%0D%0A%0D%0A${form.message}`;
    window.location.href = `mailto:${CONTACT.email}?subject=Session Booking - ${form.subject}&body=${body}`;
    setSent(true);
  };
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
      <div onClick={e => e.stopPropagation()} style={{background:"#fff",borderRadius:18,padding:36,maxWidth:480,width:"100%",position:"relative",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
        <button onClick={onClose} style={{position:"absolute",top:16,right:18,background:"none",border:"none",fontSize:"1.4rem",cursor:"pointer",color:"#888"}}>✕</button>
        {sent ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:"3rem",marginBottom:12}}>✅</div>
            <h2 style={{fontSize:"1.4rem",fontWeight:800,marginBottom:8}}>Thank you!</h2>
            <p style={{color:"#666"}}>Your email client should have opened. We'll be in touch shortly.</p>
            <button onClick={onClose} style={{marginTop:20,background:"#7c3aed",color:"#fff",border:"none",padding:"12px 28px",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Close</button>
          </div>
        ) : (
          <>
            <h2 style={{fontSize:"1.5rem",fontWeight:800,marginBottom:6}}>Book a Free Consultation</h2>
            <p style={{color:"#666",fontSize:".9rem",marginBottom:20}}>Fill in your details and we'll get back to you.</p>
            <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
              <input required name="name" placeholder="Your name" value={form.name} onChange={change} style={inputStyle} />
              <input required type="email" name="email" placeholder="Your email" value={form.email} onChange={change} style={inputStyle} />
              <select name="subject" value={form.subject} onChange={change} style={inputStyle}>
                {subjects.map(s => <option key={s.name}>{s.name}</option>)}
              </select>
              <textarea name="message" placeholder="Tell us about your goals..." value={form.message} onChange={change} rows={4} style={{...inputStyle,resize:"vertical"}} />
              <button type="submit" style={{background:"#7c3aed",color:"#fff",border:"none",padding:"14px",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:"1rem"}}>Send Request</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── Navbar ──────────────────────────────────────────────────
function Navbar({ onSearch, onBook }) {
  const [q, setQ] = useState("");
  const submit = (e) => { e.preventDefault(); onSearch(q); };
  const links = [["Home","home"],["Subjects","subjects"],["Resources","resources"],["About","why"],["Video","video"],["Contact","contact"]];
  return (
    <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 40px",background:"#fff",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 6px rgba(0,0,0,.08)",flexWrap:"wrap",gap:12}}>
      <div onClick={() => scrollTo("home")} style={{display:"flex",alignItems:"center",gap:10,fontSize:"1.4rem",fontWeight:800,color:"#7c3aed",cursor:"pointer"}}>
        <div style={{width:38,height:38,background:"linear-gradient(135deg,#7c3aed,#06b6d4)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:".9rem"}}>JD</div>
        JDScience
      </div>
      <ul style={{display:"flex",gap:24,listStyle:"none",margin:0,padding:0}}>
        {links.map(([label,id]) => (
          <li key={id}><a onClick={() => scrollTo(id)} style={{color:"#444",fontWeight:500,fontSize:".95rem",textDecoration:"none",cursor:"pointer"}}>{label}</a></li>
        ))}
      </ul>
      <form onSubmit={submit} style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{display:"flex",alignItems:"center",background:"#f3f4f6",borderRadius:8,padding:"8px 14px",gap:8,border:"1px solid #e5e7eb"}}>
          <span>🔍</span>
          <input type="text" placeholder="Search subjects, topics..." value={q} onChange={e => setQ(e.target.value)}
            style={{border:"none",background:"transparent",outline:"none",fontSize:".9rem",width:160,color:"#333"}} />
        </div>
        <button type="submit" style={{background:"#7c3aed",color:"#fff",border:"none",padding:"10px 16px",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:".85rem"}}>Search</button>
      </form>
      <button onClick={onBook} style={{background:"#7c3aed",color:"#fff",border:"none",padding:"10px 22px",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:".9rem"}}>Book a Session</button>
    </nav>
  );
}

// ── Search Results ──────────────────────────────────────────
function SearchResults({ query, onClose }) {
  const results = subjects.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.desc.toLowerCase().includes(query.toLowerCase()) ||
    s.topics.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );
  return (
    <div style={{background:"#f9fafb",padding:"40px",borderBottom:"1px solid #e5e7eb"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <h2 style={{fontSize:"1.5rem",fontWeight:800}}>Results for "<span style={{color:"#7c3aed"}}>{query}</span>"</h2>
            <p style={{color:"#666",fontSize:".9rem",marginTop:4}}>{results.length} result{results.length !== 1 ? "s" : ""} found</p>
          </div>
          <button onClick={onClose} style={{background:"#fff",border:"1px solid #e5e7eb",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontWeight:600}}>✕ Clear</button>
        </div>
        {results.length === 0 ? (
          <div style={{textAlign:"center",padding:40,color:"#888"}}>
            <div style={{fontSize:"3rem",marginBottom:12}}>🔍</div>
            <p style={{fontSize:"1.1rem",fontWeight:600}}>No results for "{query}"</p>
            <p style={{fontSize:".9rem",marginTop:8}}>Try: Physics, Chemistry, Biology, Maths, A-Level, T-Levels</p>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:20}}>
            {results.map(s => (
              <div key={s.name} style={{background:"#fff",borderRadius:16,overflow:"hidden",border:"1px solid #e5e7eb"}}>
                <div style={{height:80,background:s.bg,display:"flex",alignItems:"center",padding:"0 20px",gap:12}}>
                  <span style={{fontSize:"1.8rem"}}>{s.icon}</span>
                  <span style={{color:"#fff",fontWeight:700,fontSize:"1.1rem"}}>{s.name}</span>
                </div>
                <div style={{padding:"16px 20px"}}>
                  <p style={{color:"#555",fontSize:".9rem",lineHeight:1.6,marginBottom:12}}>{s.desc}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {s.topics.map(t => (
                      <span key={t} style={{background:"#f3e8ff",color:"#7c3aed",fontSize:".78rem",padding:"3px 10px",borderRadius:20,fontWeight:500}}>{t}</span>
                    ))}
                  </div>
                </div>
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
    <section id="home" style={{minHeight:"92vh",background:"linear-gradient(135deg,#1a0533 0%,#2d1060 50%,#0f2557 100%)",display:"flex",alignItems:"center",padding:"60px 40px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",borderRadius:"50%",opacity:.35,width:300,height:300,background:"radial-gradient(circle,#a855f7,transparent)",top:"-60px",right:"10%"}} />
      <div style={{position:"absolute",borderRadius:"50%",opacity:.35,width:200,height:200,background:"radial-gradient(circle,#06b6d4,transparent)",bottom:"10%",right:"25%"}} />
      <div style={{position:"absolute",borderRadius:"50%",opacity:.35,width:160,height:160,background:"radial-gradient(circle,#f59e0b,transparent)",bottom:"20%",right:"5%"}} />
      <div style={{position:"absolute",borderRadius:"50%",opacity:.35,width:120,height:120,background:"radial-gradient(circle,#ec4899,transparent)",top:"30%",right:"40%"}} />
      <div style={{maxWidth:620,position:"relative",zIndex:2}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.1)",color:"#fff",padding:"8px 16px",borderRadius:50,fontSize:".85rem",marginBottom:28,border:"1px solid rgba(255,255,255,.15)"}}>
          🏆 Expert Science & Maths Tutoring
        </div>
        <h1 style={{fontSize:"3.6rem",fontWeight:900,color:"#fff",lineHeight:1.1,marginBottom:24}}>
          Learn <span style={{color:"#a78bfa"}}>Smarter</span>.<br/>
          Revise <span style={{color:"#2dd4bf"}}>Better</span>.<br/>
          Achieve <span style={{color:"#fbbf24"}}>More</span>.
        </h1>
        <p style={{color:"rgba(255,255,255,.8)",fontSize:"1.1rem",lineHeight:1.7,marginBottom:36}}>
          Personalised tutoring in Physics, Chemistry, Biology, and Maths.<br/>
          Tailored sessions designed to boost confidence, understanding, and grades.
        </p>
        <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:40}}>
          <button onClick={() => scrollTo("subjects")} style={{background:"rgba(255,255,255,.15)",color:"#fff",padding:"14px 28px",borderRadius:10,border:"1px solid rgba(255,255,255,.25)",fontWeight:600,fontSize:"1rem",cursor:"pointer"}}>Explore Subjects</button>
          <button onClick={onBook} style={{background:"#fff",color:"#7c3aed",padding:"14px 28px",borderRadius:10,border:"none",fontWeight:700,fontSize:"1rem",cursor:"pointer"}}>Book a Free Consultation</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
          <span style={{color:"rgba(255,255,255,.6)",fontSize:".85rem"}}>Exam Boards Covered:</span>
          {["AQA","Edexcel","OCR","WJEC","iGCSE"].map(b => (
            <span key={b} style={{color:"rgba(255,255,255,.85)",fontSize:".9rem",fontWeight:600}}>{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Video Section ───────────────────────────────────────────
function VideoSection() {
  return (
    <section id="video" style={{padding:"80px 40px",background:"#0f0820"}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <h2 style={{fontSize:"2.2rem",fontWeight:800,color:"#fff"}}>See How We <span style={{color:"#a78bfa"}}>Teach</span></h2>
        <p style={{color:"rgba(255,255,255,.7)",marginTop:10}}>Watch a quick introduction to our tutoring approach.</p>
      </div>
      <div style={{maxWidth:860,margin:"0 auto",borderRadius:16,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
        <div style={{position:"relative",paddingTop:"56.25%"}}>
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="JDScience Introduction"
            style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
      <p style={{textAlign:"center",color:"rgba(255,255,255,.45)",fontSize:".8rem",marginTop:14}}>Replace the video URL with your own YouTube/Vimeo embed link.</p>
    </section>
  );
}

// ── Subjects ────────────────────────────────────────────────
function Subjects() {
  return (
    <section id="subjects" style={{padding:"80px 40px"}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <h2 style={{fontSize:"2.2rem",fontWeight:800}}>Subjects We <span style={{color:"#7c3aed"}}>Offer</span></h2>
        <p style={{color:"#666",fontSize:"1rem",marginTop:10,maxWidth:520,margin:"10px auto 0"}}>Expert tutoring across core science and maths subjects, tailored to your curriculum and learning style.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:24,maxWidth:900,margin:"0 auto"}}>
        {subjects.map(s => (
          <div key={s.name} style={{borderRadius:16,overflow:"hidden",border:"1px solid #e5e7eb",cursor:"pointer"}}>
            <div style={{height:200,background:s.bg,position:"relative",display:"flex",alignItems:"flex-end",padding:14}}>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"4rem",opacity:.4}}>{s.icon}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,color:"#fff",fontWeight:700,fontSize:"1.1rem",position:"relative",zIndex:1}}>
                <div style={{width:36,height:36,background:"rgba(255,255,255,.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>{s.icon}</div>
                {s.name}
              </div>
            </div>
            <div style={{padding:"18px 20px 22px"}}>
              <p style={{color:"#555",fontSize:".93rem",lineHeight:1.6,marginBottom:14}}>{s.desc}</p>
              <a onClick={() => scrollTo("contact")} style={{color:"#7c3aed",fontWeight:600,fontSize:".9rem",textDecoration:"none",cursor:"pointer"}}>Learn more →</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Resources (with upload) ─────────────────────────────────
function Resources() {
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);
  const handleUpload = (e) => {
    const newFiles = Array.from(e.target.files).map(f => ({
      name: f.name,
      size: (f.size / 1024).toFixed(1) + " KB",
      url: URL.createObjectURL(f)
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };
  return (
    <section id="resources" style={{padding:"80px 40px",background:"#f9fafb"}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <h2 style={{fontSize:"2.2rem",fontWeight:800}}>Learning <span style={{color:"#7c3aed"}}>Resources</span></h2>
        <p style={{color:"#666",marginTop:10}}>Upload and access revision notes, worksheets, and past papers.</p>
      </div>
      <div style={{maxWidth:760,margin:"0 auto"}}>
        <div onClick={() => inputRef.current.click()} style={{border:"2px dashed #c4b5fd",borderRadius:16,padding:"40px",textAlign:"center",cursor:"pointer",background:"#fff"}}>
          <div style={{fontSize:"2.5rem",marginBottom:10}}>📁</div>
          <p style={{fontWeight:700,fontSize:"1.05rem",marginBottom:4}}>Click to upload resources</p>
          <p style={{color:"#888",fontSize:".85rem"}}>PDF, DOCX, images — multiple files supported</p>
          <input ref={inputRef} type="file" multiple onChange={handleUpload} style={{display:"none"}} />
        </div>
        {files.length > 0 && (
          <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:10}}>
            {files.map((f,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#fff",borderRadius:10,padding:"14px 18px",border:"1px solid #e5e7eb"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:"1.3rem"}}>📄</span>
                  <div>
                    <p style={{fontWeight:600,fontSize:".95rem"}}>{f.name}</p>
                    <p style={{color:"#888",fontSize:".8rem"}}>{f.size}</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <a href={f.url} target="_blank" rel="noreferrer" style={{color:"#7c3aed",fontWeight:600,fontSize:".85rem",textDecoration:"none"}}>View</a>
                  <a href={f.url} download={f.name} style={{color:"#06b6d4",fontWeight:600,fontSize:".85rem",textDecoration:"none"}}>Download</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Why Us ──────────────────────────────────────────────────
function WhyUs() {
  return (
    <section id="why" style={{background:"#faf5ff",padding:"80px 40px"}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <h2 style={{fontSize:"2.2rem",fontWeight:800}}>Why Choose <span style={{color:"#7c3aed"}}>JDScience</span>?</h2>
        <p style={{color:"#666",marginTop:10}}>We go beyond textbooks to deliver real understanding and lasting results.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:28,maxWidth:1000,margin:"0 auto"}}>
        {whyCards.map(c => (
          <div key={c.title} style={{background:"#fff",borderRadius:16,padding:28,border:"1px solid #e5e7eb"}}>
            <div style={{width:48,height:48,background:"#f3e8ff",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",marginBottom:16}}>{c.icon}</div>
            <h3 style={{fontSize:"1.05rem",fontWeight:700,marginBottom:8}}>{c.title}</h3>
            <p style={{color:"#666",fontSize:".9rem",lineHeight:1.6}}>{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Contact (with form) ─────────────────────────────────────
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
      <div style={{textAlign:"center",marginBottom:48}}>
        <h2 style={{fontSize:"2.2rem",fontWeight:800}}>Get In <span style={{color:"#7c3aed"}}>Touch</span></h2>
        <p style={{color:"#666",marginTop:10}}>Send us your request and we'll respond as soon as possible.</p>
      </div>
      <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1.3fr",gap:40,alignItems:"start"}}>
        {/* Contact info */}
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div style={{display:"flex",alignItems:"center",gap:14,background:"#faf5ff",padding:"18px 20px",borderRadius:12}}>
            <div style={{width:44,height:44,background:"#7c3aed",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem"}}>✉️</div>
            <div>
              <p style={{fontSize:".8rem",color:"#888",fontWeight:600}}>EMAIL</p>
              <a href={`mailto:${CONTACT.email}`} style={{color:"#7c3aed",fontWeight:700,textDecoration:"none"}}>{CONTACT.email}</a>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14,background:"#faf5ff",padding:"18px 20px",borderRadius:12}}>
            <div style={{width:44,height:44,background:"#06b6d4",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem"}}>📞</div>
            <div>
              <p style={{fontSize:".8rem",color:"#888",fontWeight:600}}>PHONE</p>
              <a href={`tel:${CONTACT.phone}`} style={{color:"#06b6d4",fontWeight:700,textDecoration:"none"}}>{CONTACT.phone}</a>
            </div>
          </div>
          <p style={{color:"#666",fontSize:".9rem",lineHeight:1.6}}>Prefer to talk? Call or email us directly, or fill in the form and we'll get back to you.</p>
        </div>
        {/* Contact form */}
        <div style={{background:"#fff",borderRadius:16,padding:32,border:"1px solid #e5e7eb",boxShadow:"0 8px 30px rgba(0,0,0,.06)"}}>
          {sent ? (
            <div style={{textAlign:"center",padding:"30px 0"}}>
              <div style={{fontSize:"3rem",marginBottom:12}}>✅</div>
              <h3 style={{fontSize:"1.3rem",fontWeight:800,marginBottom:8}}>Message Ready!</h3>
              <p style={{color:"#666"}}>Your email client should have opened with your request. We'll reply soon.</p>
              <button onClick={() => setSent(false)} style={{marginTop:20,background:"#7c3aed",color:"#fff",border:"none",padding:"12px 28px",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
              <input required name="name" placeholder="Your name" value={form.name} onChange={change} style={inputStyle} />
              <input required type="email" name="email" placeholder="Your email" value={form.email} onChange={change} style={inputStyle} />
              <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={change} style={inputStyle} />
              <select name="subject" value={form.subject} onChange={change} style={inputStyle}>
                {subjects.map(s => <option key={s.name}>{s.name}</option>)}
                <option>General Enquiry</option>
              </select>
              <textarea required name="message" placeholder="Your request — tell us what you need help with..." value={form.message} onChange={change} rows={5} style={{...inputStyle,resize:"vertical"}} />
              <button type="submit" style={{background:"#7c3aed",color:"#fff",border:"none",padding:"14px",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:"1rem"}}>Send Request</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ── CTA ─────────────────────────────────────────────────────
function CTA({ onBook }) {
  return (
    <section style={{background:"linear-gradient(135deg,#1a0533,#2d1060)",padding:"80px 40px",textAlign:"center"}}>
      <h2 style={{color:"#fff",fontSize:"2.2rem",fontWeight:800,marginBottom:16}}>Ready to Achieve More?</h2>
      <p style={{color:"rgba(255,255,255,.75)",fontSize:"1rem",maxWidth:480,margin:"0 auto 28px"}}>Book your free consultation today and take the first step towards better grades and greater confidence.</p>
      <button onClick={onBook} style={{background:"#fff",color:"#7c3aed",border:"none",padding:"14px 32px",borderRadius:10,fontWeight:700,fontSize:"1rem",cursor:"pointer"}}>Book a Free Consultation</button>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{padding:"32px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #e5e7eb",flexWrap:"wrap",gap:16}}>
      <div style={{fontWeight:800,color:"#7c3aed",fontSize:"1.1rem"}}>JDScience</div>
      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
        <a href={`mailto:${CONTACT.email}`} style={{color:"#888",fontSize:".85rem",textDecoration:"none"}}>{CONTACT.email}</a>
        <a href={`tel:${CONTACT.phone}`} style={{color:"#888",fontSize:".85rem",textDecoration:"none"}}>{CONTACT.phone}</a>
      </div>
      <p style={{color:"#888",fontSize:".85rem"}}>© 2025 JDScience. All rights reserved.</p>
    </footer>
  );
}

// ── App ─────────────────────────────────────────────────────
function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  return (
    <div style={{fontFamily:"'Inter',sans-serif",color:"#111",background:"#fff"}}>
      <Navbar onSearch={setSearchQuery} onBook={() => setShowBooking(true)} />
      {searchQuery && <SearchResults query={searchQuery} onClose={() => setSearchQuery("")} />}
      {!searchQuery && (
        <>
          <Hero onBook={() => setShowBooking(true)} />
          <VideoSection />
          <Subjects />
          <Resources />
          <WhyUs />
          <Contact />
          <CTA onBook={() => setShowBooking(true)} />
        </>
      )}
      <Footer />
      {showBooking && <BookingModal onClose={() => setShowBooking(false)} />}
    </div>
  );
}

export default App;
