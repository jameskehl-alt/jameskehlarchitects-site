# jka-inquiry

Handles the inquiry form at `jameskehlarchitects.com/api/inquiry` (route in `wrangler.jsonc`, in front of the site's custom domain for that one path).

Each inquiry is posted to the Apps Script web app **JKA website inquiries** in james.kehl@gmail.com, which emails it to james@jameskehlarchitects.com (`apps-script.gs` here is a copy without the token). Free plan; Cloudflare Email Routing was not used because on the free plan it would replace the domain's Google mail records.

- Secrets on the worker: `SCRIPT_URL` (the web app's /exec URL) and `RELAY_TOKEN` (the token in the deployed script).
- Builds: the `jka-inquiry` worker is connected to this repo with root directory `/workers/inquiry`; a push to `main` redeploys it.
