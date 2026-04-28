import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  GraduationCap, FlaskConical, Atom, Dna, Calculator, CalendarDays,
  BookOpen, PlayCircle, Mail, Phone, MapPin, CreditCard, Menu, X,
  CheckCircle, Star
} from 'lucide-react';
import './styles.css';

function JDScienceWebsite() {
  const [page, setPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  const pages = ['home', 'about', 'subjects', 'booking', 'resources', 'videos', 'contact'];

  const subjects = [
    ['Chemistry', 'GCSE and A-Level Chemistry support covering concepts, calculations, practical skills and exam technique.', 'From £35/hour', <FlaskConical />],
    ['Physics', 'Support with forces, electricity, waves, energy, particles, equations, practicals and past-paper questions.', 'From £35/hour', <Atom />],
    ['Biology', 'Clear help with cell biology, physiology, genetics, ecology, required practicals and exam-style answers.', 'From £35/hour', <Dna />],
    ['Maths', 'Focused GCSE Maths support, numeracy for science, problem solving and confidence-building revision.', 'From £30/hour', <Calculator />],
  ];

  const navLabel = (p) => ({
    home: 'Home',
    about: 'About',
    subjects: 'Subjects & Pricing',
    booking: 'Book a Session',
    resources: 'Resources',
    videos: 'Videos',
    contact: 'Contact'
  }[p]);

  const go = (p) => {
    setPage(p);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const Header = ({ title, text }) => (
    <section className="pageHeader">
      <div className="container">
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );

  const SubjectCards = ({ showButtons = false }) => (
    <div className="grid four">
      {subjects.map(([title, text, price, icon]) => (
        <div className="card" key={title}>
          <div className="icon">{icon}</div>
          <h3>{title}</h3>
          <p>{text}</p>
          <strong className="price">{price}</strong>
          {showButtons && <button onClick={() => go('booking')} className="btn full">Book {title}</button>}
        </div>
      ))}
    </div>
  );

  const Home = () => (
    <>
      <section className="hero">
        <div className="container heroGrid">
          <div>
            <p className="pill">Expert tutoring in Chemistry, Physics, Biology and Maths</p>
            <h1>Helping students understand science, build confidence and achieve higher grades.</h1>
            <p>JD Science provides personalised tutoring, exam preparation, revision resources and video-based learning for GCSE, A-Level and vocational science learners.</p>
            <div className="buttons">
              <button onClick={() => go('booking')} className="btn light"><CalendarDays /> Book a Tutoring Session</button>
              <button onClick={() => go('videos')} className="btn outline"><PlayCircle /> Watch Video Lessons</button>
            </div>
          </div>
          <div className="card heroCard">
            <h2>Why choose JD Science?</h2>
            {[
              'One-to-one online or face-to-face tutoring',
              'GCSE, A-Level and vocational science support',
              'Exam-board focused revision and past-paper practice',
              'Personalised learning plans for each student',
              'Support for confidence, study skills and assessment technique'
            ].map(item => <p className="tick" key={item}><CheckCircle /> {item}</p>)}
          </div>
        </div>
      </section>
      <section className="container section">
        <SubjectCards />
      </section>
    </>
  );

  const About = () => (
    <>
      <Header title="About JD Science" text="Professional science and maths tutoring built on expert subject knowledge, clear explanation and learner confidence." />
      <section className="container section two">
        <div>
          <h2>Experienced, supportive and exam-focused teaching</h2>
          <p>JD Science supports learners who need stronger foundations, higher-grade challenge, or confidence with practical and written assessment tasks. Lessons are structured, clear and adapted to the learner’s needs.</p>
          <p>Support is available for GCSE, A-Level, BTEC and adult learners, with attention to measurable progress and effective exam technique.</p>
        </div>
        <div className="card dark">
          <h3>Who this is for</h3>
          <ul>
            <li>GCSE students preparing for exams</li>
            <li>A-Level science learners</li>
            <li>BTEC and vocational science students</li>
            <li>Adult learners returning to education</li>
            <li>Parents seeking structured science support</li>
          </ul>
        </div>
      </section>
      <section className="bluePanel">
        <div className="container">
          <h2>Testimonials</h2>
          <div className="grid three">
            {['The lessons were clear, structured and confidence-building.', 'The explanations helped me improve my exam answers.', 'Very patient and professional. The sessions were adapted to my level.'].map((t, i) => (
              <div className="card" key={i}><div className="stars"><Star /><Star /><Star /><Star /><Star /></div><p>“{t}”</p><strong>{['Parent of GCSE student','A-Level Chemistry student','Adult learner'][i]}</strong></div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  const Subjects = () => (
    <>
      <Header title="Subjects and Pricing" text="Choose focused tutoring in Chemistry, Physics, Biology and Maths, tailored to the student’s level and exam board." />
      <section className="container section"><SubjectCards showButtons /></section>
    </>
  );

  const Booking = () => (
    <>
      <Header title="Book a Tutoring Session" text="Request a lesson, consultation, revision block or group tutoring session." />
      <section className="container section two">
        <div className="card formCard">
          <h2><CalendarDays /> Booking request form</h2>
          <div className="formGrid">
            <input placeholder="Full name" />
            <input placeholder="Email address" />
            <input placeholder="Subject needed" />
            <input placeholder="Preferred lesson time" />
          </div>
          <textarea placeholder="Tell us what support you need"></textarea>
          <button className="btn">Submit Booking Request</button>
        </div>
        <div className="card">
          <h3><CreditCard /> Payment</h3>
          <p>Add secure payment links for lessons, revision packages or group classes.</p>
          <button className="btn full">Pay for a Session</button>
          <small>Placeholder for Stripe, PayPal or bank transfer instructions.</small>
        </div>
      </section>
    </>
  );

  const Resources = () => (
    <>
      <Header title="Resources and Blog" text="Revision materials, study guidance, exam tips and downloadable science learning resources." />
      <section className="container section grid three">
        {['Revision Worksheets', 'Past-Paper Practice', 'Study Skills Blog', 'Practical Science Notes', 'Exam Technique Guides', 'Parent Support Advice'].map(title => (
          <div className="card" key={title}><BookOpen /><h3>{title}</h3><p>Placeholder section for downloadable content, articles and guidance.</p></div>
        ))}
      </section>
    </>
  );

  const Videos = () => (
    <>
      <Header title="Video Lessons" text="A dedicated section for science explanation videos, past-paper walkthroughs and revision clips." />
      <section className="container section grid three">
        {['Chemistry Videos', 'Physics Videos', 'Biology Videos', 'Maths Support', 'Required Practicals', 'Past-Paper Walkthroughs'].map(title => (
          <div className="card video" key={title}><div><PlayCircle /></div><h3>{title}</h3><p>Embed YouTube, Vimeo or self-hosted videos here.</p></div>
        ))}
      </section>
    </>
  );

  const Contact = () => (
    <>
      <Header title="Contact JD Science" text="Get in touch to discuss tutoring, revision support, group lessons, resources or video learning." />
      <section className="container section two">
        <div>
          <h2>Start your science learning journey</h2>
          <p>Use the enquiry form or contact details below to discuss the support you need.</p>
          <p className="contact"><Mail /> jd943791@gmail.com</p>
          <p className="contact"><Phone /> Add phone number</p>
          <p className="contact"><MapPin /> London, United Kingdom</p>
        </div>
        <div className="card">
          <h3>Send an enquiry</h3>
          <input placeholder="Name" />
          <input placeholder="Email" />
          <input placeholder="Subject / level" />
          <textarea placeholder="Message"></textarea>
          <button className="btn full">Send Message</button>
        </div>
      </section>
    </>
  );

  const CurrentPage = { home: <Home />, about: <About />, subjects: <Subjects />, booking: <Booking />, resources: <Resources />, videos: <Videos />, contact: <Contact /> }[page];

  return (
    <div>
      <header>
        <div className="container nav">
          <button className="brand" onClick={() => go('home')}>
            <span><GraduationCap /></span>
            <b>JD Science<small>Science and Maths Tutoring</small></b>
          </button>
          <nav className="desktop">
            {pages.map(p => <button className={page === p ? 'active' : ''} onClick={() => go(p)} key={p}>{navLabel(p)}</button>)}
          </nav>
          <button className="btn book" onClick={() => go('booking')}>Book Now</button>
          <button className="menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <div className="mobile">{pages.map(p => <button onClick={() => go(p)} key={p}>{navLabel(p)}</button>)}</div>}
      </header>
      <main>{CurrentPage}</main>
      <footer>© {new Date().getFullYear()} JD Science. Professional science and maths tutoring.</footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<JDScienceWebsite />);
