import { useState } from 'react';
import { Mail, Github, Linkedin, Phone, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { profile, socials, api } from '../config';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { Magnetic } from './Magnetic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Please enter your name.';
  else if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!values.email.trim()) errors.email = 'Please enter your email.';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Please enter a valid email address.';
  if (!values.message.trim()) errors.message = 'Please enter a message.';
  else if (values.message.trim().length < 10) errors.message = 'Message must be at least 10 characters.';
  return errors;
}

const initialState = { name: '', email: '', message: '' };

export function Contact() {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // 'sending' | 'sent' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch(`${api.baseUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
      setStatus('sent');
      setValues(initialState);
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err.message ||
          'Could not reach the server. Make sure the backend is running and try again.'
      );
    }
  };

  return (
    <section id="contact" aria-label="Contact">
      <div className="container">
        <SectionHeading
          kicker="Contact"
          title="Let's Build Something Great"
          sub="Have a project in mind, an opportunity to share, or just want to say hello? My inbox is always open."
        />

        <div className="contact-grid">
          <Reveal>
            <div className="contact-info">
              <p>
                I'm currently focused on growing as a full-stack developer and would love to
                connect with people who are building interesting things. Reach out and I'll get
                back to you as soon as I can.
              </p>

              <div className="contact-links">
                <Magnetic strength={8} max={5}>
                  <a className="contact-link" href={`mailto:${socials.email}`}>
                    <Mail aria-hidden="true" />
                    <span className="contact-link-text">
                      <span className="contact-link-label">Email</span>
                      <span className="contact-link-value">{socials.email}</span>
                    </span>
                  </a>
                </Magnetic>
                <Magnetic strength={8} max={5}>
                  <a className="contact-link" href={`tel:${socials.phone}`}>
                    <Phone aria-hidden="true" />
                    <span className="contact-link-text">
                      <span className="contact-link-label">Phone</span>
                      <span className="contact-link-value">{socials.phoneDisplay}</span>
                    </span>
                  </a>
                </Magnetic>
                <Magnetic strength={8} max={5}>
                  <a className="contact-link" href={socials.github} target="_blank" rel="noreferrer">
                    <Github aria-hidden="true" />
                    <span className="contact-link-text">
                      <span className="contact-link-label">GitHub</span>
                      <span className="contact-link-value">{socials.githubUser}</span>
                    </span>
                  </a>
                </Magnetic>
                <Magnetic strength={8} max={5}>
                  <a className="contact-link" href={socials.linkedin} target="_blank" rel="noreferrer">
                    <Linkedin aria-hidden="true" />
                    <span className="contact-link-text">
                      <span className="contact-link-label">LinkedIn</span>
                      <span className="contact-link-value">{profile.shortName}</span>
                    </span>
                  </a>
                </Magnetic>
              </div>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <form className="card contact-form glow-border" onSubmit={onSubmit} noValidate>
              <div className="form-row">
                <div className="field">
                  <label className="field-label" htmlFor="contact-name">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    className="field-input"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={values.name}
                    onChange={onChange}
                    aria-invalid={Boolean(errors.name)}
                    autoComplete="name"
                  />
                  {errors.name && <span className="field-error" role="alert">{errors.name}</span>}
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    className="field-input"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={values.email}
                    onChange={onChange}
                    aria-invalid={Boolean(errors.email)}
                    autoComplete="email"
                  />
                  {errors.email && <span className="field-error" role="alert">{errors.email}</span>}
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  className="field-textarea"
                  name="message"
                  placeholder="Tell me about your project or idea..."
                  value={values.message}
                  onChange={onChange}
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && (
                  <span className="field-error" role="alert">{errors.message}</span>
                )}
              </div>

              {status === 'sent' && (
                <div className="form-status success" role="status">
                  <CheckCircle2 aria-hidden="true" />
                  <span>
                    Message received! Thanks for reaching out — I'll get back to you soon.
                  </span>
                </div>
              )}

              {status === 'error' && (
                <div className="form-status error" role="alert">
                  <AlertCircle aria-hidden="true" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Magnetic strength={14} max={8}>
                <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
                  <Send className="btn-icon" aria-hidden="true" />
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </Magnetic>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
