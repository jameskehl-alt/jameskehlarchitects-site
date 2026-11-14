// JKA website inquiries: receives each inquiry from the site's Cloudflare handler and emails it to James.
// Deployed as a web app (Execute as: me; Who has access: Anyone). The token keeps anyone else from using it.
const TOKEN = '<set in the deployed script>';
const TO = 'james@jameskehlarchitects.com';

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return out_(false, 'bad json'); }
  if (d.token !== TOKEN) return out_(false, 'denied');
  const opts = { name: 'JKA website' };
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.replyTo || '')) opts.replyTo = d.replyTo;
  MailApp.sendEmail(TO, String(d.subject || 'New inquiry').slice(0, 200), String(d.body || '').slice(0, 20000), opts);
  return out_(true, 'sent');
}

function doGet() { return out_(true, 'JKA inquiry relay'); }

function out_(ok, msg) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok, msg: msg })).setMimeType(ContentService.MimeType.JSON);
}
