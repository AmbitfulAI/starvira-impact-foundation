// Minimal stroke icon set (24x24). Social glyphs are simplified, recognisable outlines.
const P = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pin: '<path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
  phone: '<path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  heart: '<path d="M12 20s-7.5-4.6-9-9.4C2 7.2 4.3 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 2.9 0 5.2 2.7 4.2 6.1C19.5 15.4 12 20 12 20z"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.6-3.3 3-5.3 6-5.3s5.4 2 6 5.3"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.3c2.4.2 4 1.9 4.5 4.7"/>',
  book: '<path d="M12 6.5C10.3 5.2 7.8 4.5 4 4.5v13c3.8 0 6.3.7 8 2 1.7-1.3 4.2-2 8-2v-13c-3.8 0-6.3.7-8 2z"/><path d="M12 6.5v13"/>',
  leaf: '<path d="M5 19c0-8 5-13.5 14-14 .5 9-5 14-13 14z"/><path d="M5 19c3-4 6-6.5 9-8"/>',
  sprout: '<path d="M12 21v-8"/><path d="M12 13c0-3.5-2.5-6-7-6 0 3.5 2.5 6 7 6z"/><path d="M12 11c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6z"/><path d="M7 21h10"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  hand: '<path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V10M10 9.5v-5a1.5 1.5 0 0 1 3 0v5M13 9.5V6a1.5 1.5 0 0 1 3 0v6"/><path d="M16 12V9.5a1.5 1.5 0 0 1 3 0v4.5a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.7L3.6 14.6a1.6 1.6 0 0 1 2.5-2l.9 1.1V11"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  gift: '<rect x="3.5" y="9" width="17" height="11.5" rx="2"/><path d="M3.5 13h17M12 9v11.5"/><path d="M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9zM12 9c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z"/>',
  building: '<path d="M4 21V6l8-3 8 3v15"/><path d="M9 21v-4h6v4M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01"/>',
  repeat: '<path d="M17 2.5l3 3-3 3"/><path d="M4 11.5V10a4.5 4.5 0 0 1 4.5-4.5H20M7 21.5l-3-3 3-3"/><path d="M20 12.5V14a4.5 4.5 0 0 1-4.5 4.5H4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  scale: '<path d="M12 4v16M7 20h10M5 7h14"/><path d="M5 7l-2.5 6a3 3 0 0 0 5 0zM19 7l-2.5 6a3 3 0 0 0 5 0z"/>',
  eye: '<path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"/><circle cx="12" cy="12" r="3"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  file: '<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5M8.5 13h7M8.5 17h5"/>',
  share: '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  sparkle: '<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"/>',
  handshake: '<path d="M2.5 11.5L6 8l3 1 3-2.5 3 .5 3.5 3.5M2.5 11.5L7 16c.8.8 2 .8 2.8 0M18.5 10.5L21.5 13l-4.5 4.5c-.8.8-2 .8-2.8 0l-4.2-4.2"/><path d="M12 6.5l-2.5 3a1.5 1.5 0 0 0 2.3 1.9L13.5 9.5l3.5 3.5"/>',
  // Social (filled glyphs use fill="currentColor")
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".9" fill="currentColor"/>',
  facebook: '<path d="M14.5 21v-7.5h2.7l.4-3.2h-3.1V8.4c0-.9.3-1.6 1.6-1.6h1.6V4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.3H8.6v3.2h2.7V21"/>',
  linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5V16.5M8 7.5v.2M11.5 16.5v-6M11.5 13c0-1.6 1-2.6 2.4-2.6s2.1.9 2.1 2.6v3.5"/>',
  x: '<path d="M4.5 4.5l15 15M19.5 4.5l-15 15"/>',
  tiktok: '<path d="M14 3.5v11.2a3.8 3.8 0 1 1-3.3-3.8"/><path d="M14 3.5c.4 2.6 2.1 4.3 5 4.6"/>',
  youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.2 9.2l4.8 2.8-4.8 2.8z" fill="currentColor"/>',
  whatsapp: '<path d="M4 20l1.2-3.8A8.5 8.5 0 1 1 8 19z"/><path d="M9 8.5c-.3 1.8.8 3.8 2.4 5.2 1.6 1.4 3.4 2 4.6 1.3l.5-1.3-2-1-1 .9c-1-.4-2.2-1.6-2.7-2.6l.8-1-.9-2.1z"/>',
};

export function icon(name, size = 20, extra = '') {
  const body = P[name];
  if (!body) throw new Error('Unknown icon ' + name);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra}>${body}</svg>`;
}
