// Shared form definitions: used to render options on the website and to validate submissions on the server.

export const CONTACT_CATEGORIES = [
  'General question', 'Partnership enquiry', 'Volunteering', 'Donations and contributions',
  'Programme enquiry', 'Idea or suggestion', 'Media enquiry', 'Other',
];
export const VOLUNTEER_LOCATIONS = ['Akure', 'Akungba Akoko', 'Elsewhere in Ondo State', 'Elsewhere in Nigeria', 'Outside Nigeria (remote support)'];
export const VOLUNTEER_AVAILABILITY = ['A few hours a month', 'A few hours a week', 'Weekends only', 'For specific events', 'Remote or online only'];
export const PARTNERSHIP_TYPES = ['Corporate sponsorship', 'Corporate social responsibility (CSR) programme', 'Institutional or grant funding', 'Educational partnership', 'Community or faith organisation', 'In-kind support', 'Employee volunteering', 'Other'];
export const SUPPORT_TYPES = ['Funding', 'In-kind materials or services', 'Volunteers or professional skills', 'Venue or logistics', 'Other'];
export const PROGRAMME_NAMES = ['Back to School Project', 'Healthy Living Outreach', 'Women Rise Programme', 'Skills and Livelihood Training', 'Girls and Women Safe Space', 'Community Empowerment Drives', 'Volunteer and Youth Engagement', 'Where it is needed most'];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s-]{7,20}$/;

const f = (name, label, opts = {}) => ({ name, label, max: 200, ...opts });

export const FORMS = {
  contact: {
    title: 'Contact form',
    fields: [
      f('fullName', 'Full name', { required: true, max: 120 }),
      f('email', 'Email', { required: true, type: 'email' }),
      f('phone', 'Telephone', { type: 'tel', max: 30 }),
      f('organisation', 'Organisation', { max: 150 }),
      f('category', 'Enquiry category', { required: true, oneOf: CONTACT_CATEGORIES }),
      f('subject', 'Subject', { required: true, max: 160 }),
      f('message', 'Message', { required: true, min: 20, max: 5000 }),
      f('consent', 'Consent', { required: true, checkbox: true }),
    ],
  },
  volunteer: {
    title: 'Volunteer registration',
    fields: [
      f('fullName', 'Full name', { required: true, max: 120 }),
      f('email', 'Email', { required: true, type: 'email' }),
      f('phone', 'Telephone', { required: true, type: 'tel', max: 30 }),
      f('location', 'Location', { required: true, oneOf: VOLUNTEER_LOCATIONS }),
      f('availability', 'Availability', { required: true, oneOf: VOLUNTEER_AVAILABILITY }),
      f('interests', 'Areas of interest', { multi: true, oneOf: PROGRAMME_NAMES }),
      f('skills', 'Skills and experience', { max: 2000 }),
      f('message', 'Anything else', { max: 3000 }),
      f('ageConfirm', 'Age confirmation', { required: true, checkbox: true }),
      f('consent', 'Consent', { required: true, checkbox: true }),
    ],
  },
  partner: {
    title: 'Partnership enquiry',
    fields: [
      f('fullName', 'Full name', { required: true, max: 120 }),
      f('email', 'Email', { required: true, type: 'email' }),
      f('phone', 'Telephone', { type: 'tel', max: 30 }),
      f('organisation', 'Organisation', { required: true, max: 150 }),
      f('role', 'Role or title', { max: 120 }),
      f('partnershipType', 'Type of partnership', { required: true, oneOf: PARTNERSHIP_TYPES }),
      f('interests', 'Programmes of interest', { multi: true, oneOf: PROGRAMME_NAMES }),
      f('message', 'Message', { required: true, min: 20, max: 5000 }),
      f('consent', 'Consent', { required: true, checkbox: true }),
    ],
  },
  idea: {
    title: 'Idea or proposal',
    fields: [
      f('fullName', 'Full name', { required: true, max: 120 }),
      f('email', 'Email', { required: true, type: 'email' }),
      f('ideaTitle', 'Title of your idea', { required: true, max: 160 }),
      f('message', 'Your idea', { required: true, min: 20, max: 5000 }),
      f('consent', 'Consent', { required: true, checkbox: true }),
    ],
  },
  sponsor: {
    title: 'Programme sponsorship interest',
    fields: [
      f('fullName', 'Full name', { required: true, max: 120 }),
      f('email', 'Email', { required: true, type: 'email' }),
      f('phone', 'Telephone', { type: 'tel', max: 30 }),
      f('organisation', 'Organisation', { max: 150 }),
      f('programme', 'Programme to support', { required: true, oneOf: PROGRAMME_NAMES }),
      f('supportType', 'Type of support', { required: true, oneOf: SUPPORT_TYPES }),
      f('message', 'Message', { max: 5000 }),
      f('consent', 'Consent', { required: true, checkbox: true }),
    ],
  },
  newsletter: {
    title: 'Newsletter subscription',
    fields: [f('email', 'Email', { required: true, type: 'email' })],
  },
};

function clean(v, max) {
  // Remove control characters (keep newlines and tabs), trim, and cap length.
  return String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

/**
 * Validate a submission. Returns { ok, errors, data, formType }.
 */
export function validateSubmission(body) {
  const errors = {};
  if (!body || typeof body !== 'object') return { ok: false, errors: { _form: 'Invalid submission.' } };
  const formType = String(body.formType || '');
  const def = FORMS[formType];
  if (!def) return { ok: false, errors: { _form: 'Unknown form.' } };
  const data = {};
  for (const fd of def.fields) {
    let raw = body[fd.name];
    if (fd.checkbox) {
      const on = raw === true || raw === 'on' || raw === 'yes' || raw === 'true';
      if (fd.required && !on) errors[fd.name] = 'Please tick this box to continue.';
      data[fd.name] = on;
      continue;
    }
    if (fd.multi) {
      const arr = (Array.isArray(raw) ? raw : raw ? [raw] : []).map((x) => clean(x, 200)).filter(Boolean);
      const bad = fd.oneOf && arr.find((x) => !fd.oneOf.includes(x));
      if (bad) errors[fd.name] = 'Please choose from the options provided.';
      if (fd.required && !arr.length) errors[fd.name] = 'Please choose at least one option.';
      data[fd.name] = arr.slice(0, 20);
      continue;
    }
    if (Array.isArray(raw)) raw = raw[0];
    const v = clean(raw, fd.max);
    if (fd.required && !v) { errors[fd.name] = 'This field is required.'; continue; }
    if (v) {
      if (fd.type === 'email' && !EMAIL.test(v)) errors[fd.name] = 'Please enter a valid email address.';
      else if (fd.type === 'tel' && !PHONE.test(v)) errors[fd.name] = 'Please enter a valid telephone number.';
      else if (fd.oneOf && !fd.oneOf.includes(v)) errors[fd.name] = 'Please choose from the options provided.';
      else if (fd.min && v.length < fd.min) errors[fd.name] = `Please write at least ${fd.min} characters.`;
    }
    data[fd.name] = v;
  }
  return { ok: Object.keys(errors).length === 0, errors, data, formType, def };
}

/** Spam heuristics: honeypot and minimum completion time. */
export function looksLikeSpam(body) {
  if (body && typeof body.company_url === 'string' && body.company_url.trim() !== '') return true;
  const elapsed = Number(body && body._elapsed);
  if (Number.isFinite(elapsed) && elapsed < 2500) return true;
  return false;
}

/** Plain-text email body for the Foundation's inbox. */
export function formatEmail({ def, data, formType }, meta = {}) {
  const lines = [`New ${def.title.toLowerCase()} from the Starvira website`, ''];
  for (const fd of def.fields) {
    let v = data[fd.name];
    if (fd.checkbox) v = v ? 'Yes' : 'No';
    if (Array.isArray(v)) v = v.join(', ') || 'None selected';
    if (v === '' || v === undefined) v = 'Not provided';
    lines.push(`${fd.label}: ${v}`);
  }
  lines.push('', '---', `Form: ${formType}`, `Page: ${meta.page || 'unknown'}`, `Received: ${new Date().toISOString()}`);
  const who = data.fullName || data.email;
  const subjectBits = { contact: data.category ? `${data.category}: ${data.subject}` : data.subject, volunteer: 'Volunteer registration', partner: `Partnership enquiry from ${data.organisation || who}`, idea: `Idea: ${data.ideaTitle}`, sponsor: `Sponsorship interest: ${data.programme}`, newsletter: 'New newsletter subscriber' };
  const subject = `[Starvira website] ${subjectBits[formType] || def.title}${formType !== 'newsletter' && who ? ` (${who})` : ''}`.replace(/[\r\n]+/g, ' ').slice(0, 200);
  return { subject, text: lines.join('\n') };
}
