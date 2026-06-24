import React from "react";

function App() {
  const [formData, setFormData] = React.useState({
    studentName: '', parentName: '', email: '', phone: '',
    level: '', subject: '', examBoard: '', tuitionType: '', message: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Booking request submitted! We will be in touch shortly.');
  };

  const teal = '#009688';
  const darkTeal = '#00796b';
  const deepTeal = '#004d40';

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: "'Segoe UI', Arial, sans-serif", color: '#222', background: '#f5f5f5' }}>

      {/* HEADER */}
      <div style={{ background: teal, padding: '18px 40px', display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 60, height: 60, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: teal, flexShrink: 0 }}>JD</div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: 1 }}>jdscience.co.uk</div>
          <div style={{ fontSize: 13, color: '#b2dfdb', marginTop: 2 }}>GCSE · A-Level · T-Level · Science & Maths Tuition and Resources</div>
        </div>
      </div>

      {/* NAV */}
      <div style={{ background: '#222', display: 'flex', flexWrap: 'wrap', padding: '0 30px' }}>
        {['Home','GCSE','A-Level','T-Level','Past Papers','Resources','Find a Tutor','Book Tuition','About','Contact'].map(item => (
          <a key={item} href="#" style={{ color: '#ddd', textDecoration: 'none', padding: '14px 16px', fontSize: 13, fontWeight: 600, display: 'block' }}
            onMouseEnter={e => { e.target.style.background = teal; e.target.style.color = 'white'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#ddd'; }}>
            {item}
          </a>
        ))}
      </div>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #004d40 0%, #009688 60%, #4db6ac 100%)', padding: '60px 40px 50px', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, textShadow: '0 2px 8px rgba(0,0,0,0.2)', margin: '0 0 14px' }}>GCSE, A-Level & T-Level Science and Maths</h2>
        <p style={{ fontSize: 17, maxWidth: 680, margin: '0 auto 28px', color: '#e0f2f1', lineHeight: 1.6 }}>Expert tuition and exam-board specific resources — worksheets, revision notes, past questions and marking schemes for Physics, Chemistry, Biology and Maths.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#resources" style={{ background: 'white', color: teal, padding: '13px 32px', borderRadius: 4, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>Browse Resources</a>
          <a href="#booking" style={{ background: 'transparent', color: 'white', padding: '13px 32px', borderRadius: 4, fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '2px solid white' }}>Book a Tutor</a>
        </div>
      </div>

      {/* EXAM BOARD STRIP */}
      <div style={{ background: darkTeal, padding: '12px 40px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ color: '#b2dfdb', fontSize: 13, fontWeight: 600, marginRight: 8 }}>Exam Boards Covered:</span>
        {['AQA','Edexcel','OCR','Eduqas','WJEC'].map(b => (
          <span key={b} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{b}</span>
        ))}
      </div>

      {/* RESOURCE CARDS */}
      <div id="resources" style={{ padding: '50px 40px' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: deepTeal, marginBottom: 8 }}>Resources &amp; Support</div>
        <div style={{ color: '#555', fontSize: 14, marginBottom: 16 }}>Everything you need to revise, practise and succeed</div>
        <div style={{ width: 50, height: 4, background: teal, borderRadius: 2, marginBottom: 30 }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { icon: '📋', title: 'GCSE Resources', desc: 'Worksheets, revision notes, past questions and marking schemes for all GCSE Science and Maths specifications.', tags: ['Physics','Chemistry','Biology','Maths'], btn: 'View GCSE Resources' },
            { icon: '🎓', title: 'A-Level Resources', desc: 'Topic notes, exam questions, marking schemes and revision materials tailored to A-Level specifications.', tags: ['Physics','Chemistry','Biology','Maths'], btn: 'View A-Level Resources' },
            { icon: '🏗️', title: 'T-Level Resources', desc: 'Support materials, worksheets and assessment preparation for T-Level Science, Health and Engineering students.', tags: ['Science','Health Science','Engineering'], btn: 'View T-Level Resources' },
            { icon: '📄', title: 'Past Questions', desc: 'Exam-style and past paper questions organised by level, subject, exam board and topic for targeted practice.', tags: ['AQA','Edexcel','OCR','Eduqas'], btn: 'Practise Questions' },
            { icon: '✅', title: 'Marking Schemes', desc: 'Clear and detailed marking schemes to help students check their answers and improve exam technique.', tags: ['GCSE','A-Level','T-Level'], btn: 'View Mark Schemes' },
            { icon: '👨‍🏫', title: 'Find a Tutor', desc: 'One-to-one online or in-person tuition with subject-specialist tutors for GCSE, A-Level and T-Level students.', tags: ['Online','In-Person','1-to-1'], btn: 'Book a Tutor' },
          ].map(c => (
            <div key={c.title} style={{ background: 'white', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '26px 24px', borderTop: '4px solid #009688' }}>
              <div style={{ fontSize: 30, marginBottom: 12 }}>{c.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: deepTeal, marginBottom: 8 }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 14 }}>{c.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {c.tags.map(t => <span key={t} style={{ background: '#e0f2f1', color: '#00695c', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>{t}</span>)}
              </div>
              <a href="#" style={{ display: 'inline-block', background: teal, color: 'white', padding: '9px 20px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>{c.btn}</a>
            </div>
          ))}
        </div>
      </div>

      {/* CHOOSE YOUR LEVEL */}
      <div style={{ background: '#263238', padding: '50px 40px', color: 'white' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 8 }}>Choose Your Level</div>
        <div style={{ color: '#90a4ae', fontSize: 14, marginBottom: 16 }}>Select your qualification level to find relevant resources and tuition</div>
        <div style={{ width: 50, height: 4, background: teal, borderRadius: 2, marginBottom: 30 }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { title: 'GCSE', desc: 'Resources and tuition for GCSE students studying Science and Maths across all major exam boards.', items: ['Physics, Chemistry, Biology, Maths','AQA, Edexcel, OCR, Eduqas','Worksheets & Revision Notes','Past Questions & Mark Schemes'] },
            { title: 'A-Level', desc: 'In-depth resources and expert tuition for A-Level students aiming for top grades in Science and Maths.', items: ['Physics, Chemistry, Biology, Maths','AQA, Edexcel, OCR, Eduqas','Topic Notes & Exam Questions','Practical Skills & Exam Technique'] },
            { title: 'T-Level', desc: 'Specialist support and assessment preparation for T-Level learners in Science, Health and Engineering.', items: ['Science, Health Science, Engineering','Core Knowledge Materials','Assessment Practice','Employer Set Project Support'] },
          ].map(l => (
            <div key={l.title} style={{ background: '#37474f', borderRadius: 8, padding: '28px 24px', borderLeft: '5px solid #009688' }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#4db6ac', marginBottom: 10 }}>{l.title}</h3>
              <p style={{ fontSize: 13, color: '#b0bec5', lineHeight: 1.6, marginBottom: 16 }}>{l.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 18 }}>
                {l.items.map(i => <li key={i} style={{ fontSize: 13, color: '#cfd8dc', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>→ {i}</li>)}
              </ul>
              <a href="#" style={{ display: 'inline-block', background: teal, color: 'white', padding: '9px 22px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>{l.title} Resources</a>
            </div>
          ))}
        </div>
      </div>

      {/* SUBJECTS */}
      <div style={{ background: '#f9f9f9', padding: '50px 40px' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: deepTeal, marginBottom: 8 }}>Our Subjects</div>
        <div style={{ color: '#555', fontSize: 14, marginBottom: 16 }}>Specialist resources and tuition across all core Science and Maths subjects</div>
        <div style={{ width: 50, height: 4, background: teal, borderRadius: 2, marginBottom: 30 }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { icon: '⚡', title: 'Physics', desc: 'Forces, energy, waves, electricity, magnetism and nuclear physics.' },
            { icon: '🧪', title: 'Chemistry', desc: 'Atomic structure, bonding, reactions, organic chemistry and analysis.' },
            { icon: '🧬', title: 'Biology', desc: 'Cell biology, genetics, ecology, physiology and evolution.' },
            { icon: '📐', title: 'Maths', desc: 'Pure maths, mechanics, statistics, algebra and calculus.' },
          ].map(s => (
            <div key={s.title} style={{ background: 'white', borderRadius: 8, padding: '22px 18px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderBottom: '4px solid #009688' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{s.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: deepTeal, marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 12, color: '#888', marginBottom: 14, lineHeight: 1.5 }}>{s.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
                {['GCSE','A-Level','T-Level'].map(l => <span key={l} style={{ background: '#e0f2f1', color: '#00695c', fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 10 }}>{l}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
{/* ABOUT US */}
<div id="about" style={{ background: 'white', padding: '50px 40px' }}>
  <div style={{ maxWidth: 900, margin: '0 auto' }}>
    <div style={{ fontSize: 24, fontWeight: 800, color: '#004d40', marginBottom: 8, textAlign: 'center' }}>Welcome to JD Science</div>
    <div style={{ width: 50, height: 4, background: '#009688', borderRadius: 2, margin: '0 auto 26px' }}></div>
    <p style={{ fontSize: 15, color: '#444', lineHeight: 1.8, marginBottom: 24, textAlign: 'center' }}>
      JD Science is a specialist provider of GCSE, A-Level and T-Level tuition and revision support in Science and Maths.
      We focus on what we do best — Physics, Chemistry, Biology and Maths — delivering high-quality teaching and exam-board
      specific resources that help students achieve their target grades.
    </p>
    <div style={{ fontSize: 17, fontWeight: 800, color: '#00695c', marginBottom: 16 }}>What makes us different:</div>
    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {[
        ['Subject specialists', 'Experienced teachers who know the Science and Maths specifications inside out, across AQA, Edexcel, OCR and Eduqas.'],
        ['Tailored tuition', "Every session is built around your child's individual needs — current grade, target grade and the topics they find most challenging."],
        ['One-to-one & small groups', 'Personalised attention with focused, distraction-free learning, online or in person.'],
        ['Exam-board specific resources', 'Worksheets, revision notes, past questions and marking schemes, organised by level, subject and exam board.'],
        ['Flexible learning', 'Online and in-person options to fit around school and family life.'],
        ['A child-safe environment', 'Our tutors hold up-to-date DBS checks, meeting safeguarding requirements.'],
        ['Proven approach', 'A clear focus on exam technique, practice and confidence-building to get results.'],
      ].map(([title, desc]) => (
        <li key={title} style={{ background: '#f9f9f9', borderRadius: 8, padding: '16px 18px', borderLeft: '4px solid #009688' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#004d40', marginBottom: 5 }}>{title}</div>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{desc}</div>
        </li>
      ))}
    </ul>
  </div>
</div>
      {/* STATS STRIP */}
      <div style={{ background: '#e0f2f1', padding: '30px 40px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 20 }}>
        {[['4','Core Subjects'],['3','Qualification Levels'],['4','Exam Boards Covered'],['1-to-1','Personalised Tuition'],['Online','& In-Person Available']].map(([num, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: teal }}>{num}</div>
            <div style={{ fontSize: 12, color: '#555', fontWeight: 600, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* BOOKING */}
      <div id="booking" style={{ background: 'white', padding: '50px 40px' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: deepTeal, marginBottom: 8, textAlign: 'center' }}>Book a Tutor</div>
        <div style={{ color: '#555', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>One-to-one Science and Maths tuition for GCSE, A-Level and T-Level students</div>
        <div style={{ width: 50, height: 4, background: teal, borderRadius: 2, margin: '0 auto 30px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 40, maxWidth: 1000, margin: '0 auto' }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: deepTeal, marginBottom: 12 }}>Why Book with jdscience?</h3>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 20 }}>Our subject-specialist tutors provide tailored, exam-board specific tuition to help every student achieve their target grade.</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['Subject-specialist tutors','Exam-board specific teaching','GCSE, A-Level and T-Level support','Flexible online or in-person sessions','Personalised lesson plans','Past paper and exam technique practice','Physics, Chemistry, Biology and Maths'].map(i => (
                <li key={i} style={{ fontSize: 13, color: '#444', padding: '7px 0', borderBottom: '1px solid #eee' }}>✓ {i}</li>
              ))}
            </ul>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 5 }}>Student Name *</label>
                <input style={{ border: '1px solid #ddd', borderRadius: 4, padding: '10px 12px', fontSize: 13 }} name="studentName" placeholder="First and last name" value={formData.studentName} onChange={handleChange} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 5 }}>Parent / Guardian Name</label>
                <input style={{ border: '1px solid #ddd', borderRadius: 4, padding: '10px 12px', fontSize: 13 }} name="parentName" placeholder="If applicable" value={formData.parentName} onChange={handleChange} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 5 }}>Email Address *</label>
                <input style={{ border: '1px solid #ddd', borderRadius: 4, padding: '10px 12px', fontSize: 13 }} type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 5 }}>Phone Number</label>
                <input style={{ border: '1px solid #ddd', borderRadius: 4, padding: '10px 12px', fontSize: 13 }} name="phone" placeholder="+44 ..." value={formData.phone} onChange={handleChange} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 5 }}>Qualification Level *</label>
                <select style={{ border: '1px solid #ddd', borderRadius: 4, padding: '10px 12px', fontSize: 13 }} name="level" value={formData.level} onChange={handleChange}>
                  <option value="">Select level...</option>
                  <option>GCSE</option><option>A-Level</option><option>T-Level</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 5 }}>Subject *</label>
                <select style={{ border: '1px solid #ddd', borderRadius: 4, padding: '10px 12px', fontSize: 13 }} name="subject" value={formData.subject} onChange={handleChange}>
                  <option value="">Select subject...</option>
                  <option>Physics</option><option>Chemistry</option><option>Biology</option><option>Maths</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 5 }}>Exam Board</label>
                <select style={{ border: '1px solid #ddd', borderRadius: 4, padding: '10px 12px', fontSize: 13 }} name="examBoard" value={formData.examBoard} onChange={handleChange}>
                  <option value="">Select exam board...</option>
                  <option>AQA</option><option>Edexcel</option><option>OCR</option><option>Eduqas</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 5 }}>Tuition Type</label>
                <select style={{ border: '1px solid #ddd', borderRadius: 4, padding: '10px 12px', fontSize: 13 }} name="tuitionType" value={formData.tuitionType} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option>Online</option><option>In-Person</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 5 }}>Message / Areas of Support Needed</label>
              <textarea style={{ border: '1px solid #ddd', borderRadius: 4, padding: '10px 12px', fontSize: 13, resize: 'vertical', minHeight: 80 }} name="message" placeholder="Tell us about topics you need help with, your current grade, and target grade..." value={formData.message} onChange={handleChange} />
            </div>
            <button type="submit" style={{ background: teal, color: 'white', border: 'none', padding: '13px 36px', borderRadius: 4, fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%' }}>Submit Booking Request</button>
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#1a1a1a', color: '#bbb', padding: '40px 40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 30, marginBottom: 30 }}>
          <div>
            <div style={{ color: '#4db6ac', fontWeight: 900, fontSize: 18, marginBottom: 14 }}>jdscience.co.uk</div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>GCSE, A-Level and T-Level Science and Maths tuition and resources. Covering Physics, Chemistry, Biology and Maths across all major exam boards.</p>
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Quick Links</div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['Home','GCSE','A-Level','T-Level','Resources','Book a Tutor'].map(l => (
                <li key={l} style={{ marginBottom: 8 }}><a href="#" style={{ color: '#bbb', textDecoration: 'none', fontSize: 13 }}>{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Subjects</div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['Physics','Chemistry','Biology','Maths'].map(s => (
                <li key={s} style={{ marginBottom: 8 }}><a href="#" style={{ color: '#bbb', textDecoration: 'none', fontSize: 13 }}>{s}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Contact</div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['info@jdscience.co.uk','Online Tuition Available','About Us','Privacy Policy'].map(i => (
                <li key={i} style={{ marginBottom: 8 }}><a href="#" style={{ color: '#bbb', textDecoration: 'none', fontSize: 13 }}>{i}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #333', paddingTop: 18, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', flexWrap: 'wrap', gap: 10 }}>
          <span>© 2026 jdscience.co.uk · All rights reserved</span>
          <span><a href="#" style={{ color: '#4db6ac', textDecoration: 'none' }}>Privacy Policy</a> · <a href="#" style={{ color: '#4db6ac', textDecoration: 'none' }}>Terms of Use</a></span>
        </div>
      </footer>

    </div>
  );
}

export default App;
