import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSubmission, looksLikeSpam, formatEmail } from '../lib/forms.mjs';

const good = { formType: 'contact', fullName: 'Ada Test', email: 'ada@example.com', category: 'General question', subject: 'Hello', message: 'This is a sufficiently long message.', consent: 'yes' };

test('valid contact submission passes', () => {
  const r = validateSubmission(good);
  assert.equal(r.ok, true);
  assert.equal(r.data.consent, true);
});
test('missing consent and bad email fail', () => {
  const r = validateSubmission({ ...good, email: 'nope', consent: undefined });
  assert.equal(r.ok, false);
  assert.ok(r.errors.email && r.errors.consent);
});
test('select values must come from the allowed list', () => {
  assert.equal(validateSubmission({ ...good, category: 'Hacking' }).ok, false);
});
test('unknown form type is rejected', () => {
  assert.equal(validateSubmission({ formType: 'admin' }).ok, false);
});
test('volunteer multi-select accepts arrays and rejects unknown options', () => {
  const base = { formType: 'volunteer', fullName: 'A', email: 'a@b.co', phone: '+234 801 000 0000', location: 'Akure', availability: 'Weekends only', ageConfirm: 'yes', consent: 'yes' };
  assert.equal(validateSubmission({ ...base, interests: ['Back to School Project'] }).ok, true);
  assert.equal(validateSubmission({ ...base, interests: ['Fake'] }).ok, false);
});
test('control characters are stripped and lengths capped', () => {
  const r = validateSubmission({ ...good, fullName: 'Ada\u0000 Test' + 'x'.repeat(500) });
  assert.ok(!r.data.fullName.includes('\u0000'));
  assert.ok(r.data.fullName.length <= 120);
});
test('honeypot and too-fast submissions are spam', () => {
  assert.equal(looksLikeSpam({ company_url: 'http://spam' }), true);
  assert.equal(looksLikeSpam({ _elapsed: 500 }), true);
  assert.equal(looksLikeSpam({ _elapsed: 9000 }), false);
});
test('email subject cannot contain line breaks', () => {
  const r = validateSubmission({ ...good, subject: 'Hi\r\nBcc: x@y.z' });
  const e = formatEmail(r, {});
  assert.ok(!/[\r\n]/.test(e.subject));
});
