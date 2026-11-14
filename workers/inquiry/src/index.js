import { EmailMessage } from "cloudflare:email";

const FIELDS = [
  ["project", "Project"], ["county", "County"], ["size", "Rough size"], ["budget", "Rough budget"],
  ["timeline", "Hopes to start"], ["survey", "Has a survey"], ["name", "Name"], ["email", "Email"],
  ["phone", "Phone"], ["reach", "Best way and time"], ["notes", "Anything else"],
];
const clean = (v, n = 3000) => String(v || "").replace(/[\r\0]/g, "").trim().slice(0, n);
const oneLine = (v) => clean(v, 200).replace(/\n/g, " ");

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const wantsJson = (request.headers.get("Accept") || "").includes("application/json");
    const done = (ok, status = 200) => wantsJson
      ? Response.json({ ok }, { status })
      : ok ? Response.redirect(new URL("/inquiry/thanks/", request.url).toString(), 303)
           : new Response("Sorry, that did not go through. Please email james@jameskehlarchitects.com or call 740-258-7575.", { status });

    let form;
    try { form = await request.formData(); } catch { return done(false, 400); }
    if (clean(form.get("website"))) return done(true);               // honeypot: quietly accept bots
    const email = oneLine(form.get("email"));
    if (!clean(form.get("project")) || !oneLine(form.get("name")) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return done(false, 400);

    const body = FIELDS.map(([k, label]) => `${label}: ${clean(form.get(k)) || "-"}`).join("\n\n")
      + `\n\n--\nSent from the inquiry form at jameskehlarchitects.com on ${new Date().toISOString()}.`;
    const subject = `New inquiry: ${oneLine(form.get("county")) || "Ohio"}, ${oneLine(form.get("name"))}`;
    const id = `<${crypto.randomUUID()}@forms.jameskehlarchitects.com>`;
    const raw = [
      `From: JKA website <${env.FROM}>`, `To: <${env.TO}>`, `Reply-To: <${email}>`,
      `Subject: ${subject.replace(/[^\x20-\x7E]/g, "")}`, `Message-ID: ${id}`, `Date: ${new Date().toUTCString()}`,
      "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: 8bit", "", body,
    ].join("\r\n");
    try {
      await env.INQUIRY.send(new EmailMessage(env.FROM, env.TO, raw));
      return done(true);
    } catch (e) {
      console.log("send failed", e && e.message);
      return done(false, 502);
    }
  },
};
