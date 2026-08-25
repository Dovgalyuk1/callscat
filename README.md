# $CALLSCAT — Cat Sales Office

A single-page landing site about an office full of cats who scream "BUY SOLANA" into the phone 24/7.
Plain HTML/CSS/JS, no build step — just static files.

## What's inside
- `index.html` — all the markup (hero, lore, live calls feed, how-to-buy, dashboard, footer)
- `style.css` — all the styling (pixel font, red-white-blue trim from the reference art, animations)
- `script.js` — all the logic: synthesized sound (meows + "cash register" via the Web Audio API — no mp3s were provided, so the sound is generated in code), the popup toast feed of buys/sells, floating emoji, screen shake on "big" trades
- `assets/logo.jpg` — the round logo/PFP that was provided
- `assets/office-banner.jpg` — the office banner that was provided

## Before you publish for real
- **Contract (CA):** still a placeholder ("STILL ON HOLD — PLEASE DON'T HANG UP") in `index.html` (`#caValue`). Once it mints, drop in the real address and enable copy-to-clipboard in `script.js` (`caCopyBtn` — currently just shows a fake confirmation, uncomment `navigator.clipboard.writeText(realCA)`).
- **Links:** Telegram and Dexscreener are inactive ("soon") in the footer — add the real ones once they exist.
- **Live data:** the SOL price on the dashboard is currently a fake (gentle random jitter). Once you have a CA, you can wire up `https://api.dexscreener.com/latest/dex/tokens/<CA>` via fetch and swap in real numbers.
- Twitter is already real: https://x.com/CallsCatX

## Deploy (GitHub + Vercel, no terminal needed)
1. Create a repo on github.com, drag-and-drop this folder in through the web UI.
2. On vercel.com — "Add New Project" → "Import" from that repo. No build command needed, Vercel picks up the static site automatically.
3. Buy your own domain from any registrar, then add it and set the DNS records under Vercel → Settings → Domains.
