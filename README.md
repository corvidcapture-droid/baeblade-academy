# Baeblade Academy

**Live site:** https://corvidcapture-droid.github.io/baeblade-academy/  
**TV:** add `#arena` · **Admin:** add `#admin` · **Team quiz join:** add `#live`

Hosted free on GitHub Pages; live data in the Supabase project `baeblade-academy`. Content is edited in Admin. Site changes are pushed to this repository and go live in about a minute.

Party website: Blader profile quiz on guests' phones before the party, a live team quiz on the TV at the party (guests scan a QR code to join), team generation and arena screens. Everything is managed from an Admin panel. No coding needed.

## What guests do (nothing to install, no sign-up)

**Before the party** — they tap the personal invite link you send them (WhatsApp is perfect). It opens straight into *their* profile quiz. No name to pick, no PIN. 12 taps and they get their Blader card.

**At the party** — the TV shows a big QR code. They scan it with their phone camera, tap their name (skipped if they used the invite link on the same phone), and answer the team quiz questions on their phone while the TV shows the question, the countdown, the answer and the leaderboard.

Guests who aren't on your roster can type their name and join themselves (you can switch this off in Settings).

## What you do

### One-time setup (about 15 minutes, all free)
You need two free accounts. Guests need none.

**1. Database (Supabase) — makes every phone and the TV share the same data**
1. Sign up at https://supabase.com → **New project**. Any name, region: closest to you (e.g. Europe/Africa). Save the database password somewhere; you won't need it for this.
2. Left menu → **SQL Editor** → **New query**. Paste all of `supabase-setup.sql` → **Run**. You should see "Success".
3. Click **Connect** (top of the project page) or **Project Settings → API keys**. Copy:
   - the **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - the **anon / publishable key** (a long string)
4. Open `config.js` in Notepad/TextEdit and paste them between the quotes. Save.

**2. Website (Netlify) — puts the site online**
1. Sign up at https://app.netlify.com (free).
2. Go to https://app.netlify.com/drop and drag the whole **baeblade-academy** folder onto the page.
3. Netlify gives you an address like `https://jolly-tiger-123.netlify.app`. To make it nicer: **Project configuration → Change project name** → `baeblade-academy` (if it's free) → `https://baeblade-academy.netlify.app`.
4. Open that address. The top bar should show a green **Live** pill.

**3. In the site's Admin** (PIN `1234` until you change it)
1. **Settings** → change the admin PIN → Save.
2. **Bladers** → check the names, add anyone missing, upload character art if you have it.
3. **Team quiz** → fix the 3 questions marked *Check answer* (Alden's age, favourite food, Beyblade type) and add your own.
4. **Bladers → Copy all invite links** → paste into WhatsApp (or **Copy invite** per person for individual messages).

### On the day
1. Open `…netlify.app/#arena` on the TV (full screen). The lobby shows who has finished their profile, and a small QR for anyone who hasn't.
2. **Teams** tab → **Generate teams** (then tweak). **Arena control → Reveal next team** for the dramatic reveal.
3. **Team quiz** tab (works from your phone) → **Open quiz lobby on TV** → guests scan → **Start question 1** → **Reveal answer** → **Show leaderboard** → **Next question** … → **Final results**.

Scoring: a correct answer is worth 500–1000 points (faster = more). Teams are ranked by average points per member, so a team of 4 isn't unfairly ahead of a team of 3.

## Updating the site later
- **Content** (names, questions, teams, art): Admin panel, any device, changes appear instantly everywhere.
- **The site files**: change them, then Netlify → your project → **Deploys** → drag the folder onto the drop area. Party data isn't affected.

## Things to know
- **Supabase pauses free projects after 1 week with no activity.** Guests doing profiles keeps it awake. Still, open the site a day before the party; if it's paused, log in to Supabase and click **Restore project**.
- **Back up** before and after the party: Admin → Settings → Download backup.
- **Security is party-grade.** The admin PIN keeps guests out of Admin; it isn't real security, and anyone with the link could read the data. Don't store anything private.
- Without `config.js` filled in, the site still works, but only inside one browser (handy for testing).

## Files
| File | What it is |
|---|---|
| `index.html`, `app.js`, `styles.css`, `qrcode.js` | The website |
| `config.js` | Your two Supabase values |
| `defaults.js` | Starting roster and questions, used once on first launch |
| `supabase-setup.sql` | Database setup, pasted into Supabase once |
| `manifest.json`, `icon-*.png` | "Add to Home Screen" support |
