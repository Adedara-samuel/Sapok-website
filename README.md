# SAPOK TECH — website & admin console

The company website for **SAPOK TECH**, plus a private admin console to run it.

- **Public site** (`/`): eight full-screen chapters — Idea → Reality, Products, Services, Process, Clients, Mission, About, Contact — moved through with depth transitions instead of a long scroll (wheel/trackpad with pull-to-continue, arrow and number keys, swipe, the chapter dial, or the menu). Light and dark themes.
- **Admin console** (`/admin`): dashboard, enquiry inbox, a full website-content editor, and account settings.
- **Enquiries**: every message from the contact form is saved to the admin inbox **and** emailed to you.

Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion, MongoDB and Nodemailer.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no `MONGODB_URI` set, data is kept in `./.data/` (git-ignored), so everything works with zero setup.

## Admin console

Go to `/admin` and sign in. On the very first sign-in the owner account is created in the database:

| Email | Password |
| --- | --- |
| `sapoktech.c@gmail.com` | `Passw0rd` |

**Change the password straight away** in **Admin → Settings**. The password is stored hashed (scrypt), and changing it signs out every other device.

What you can do:

- **Dashboard**: new enquiries, this week's activity, system status (database, email).
- **Inbox**: read, search and filter enquiries; mark them read, unread or archived; delete them; reply by email, WhatsApp or phone.
- **Website content**: edit the hero, example ideas, about, mission, vision, values, services, process, products, clients and logos, numbers, contact details and social links. **Save & publish** updates the live site immediately.
- **Settings**: change the sign-in email and password.

## Email notifications

1. Turn on 2-Step Verification for `sapoktech.c@gmail.com`.
2. Create an **App Password** (Google Account → Security → App passwords).
3. Set `SMTP_USER=sapoktech.c@gmail.com` and `SMTP_PASS=<the 16-character app password>`.

If email isn't configured, enquiries are still saved to the inbox. The dashboard shows "email: not set" until it is.

## Deploy to Vercel

1. Create a free MongoDB Atlas cluster, copy its connection string, and allow access from anywhere (`0.0.0.0/0`), because Vercel IPs change.
2. Import this folder as a Vercel project.
3. Add the environment variables from `.env.example`. At minimum set `MONGODB_URI`, `ADMIN_SESSION_SECRET`, `SMTP_USER`, `SMTP_PASS` and `NEXT_PUBLIC_SITE_URL`.
4. Deploy, then visit `/admin` once to seed the owner account in MongoDB, and change the password.

## Project layout

```
src/
  app/
    page.tsx                  public site (reads content from the store)
    admin/login               sign-in
    admin/(console)/          dashboard, inbox, content, settings (owner only)
    api/enquiries             public contact form → save + email
    api/admin/*               login, logout, content, enquiries, account
  components/
    site/                     chapter engine (Experience.tsx) + chapters/
    admin/                    console UI
    brand/                    SAPOK logos as vector components
  lib/
    content.ts                content schema + default copy
    store.ts                  MongoDB / local-file storage
    auth.ts                   hashed owner account + signed sessions
    mailer.ts                 enquiry emails
    rate-limit.ts             spam / brute-force protection
```

## Security notes

- Admin routes check a signed, httpOnly, SameSite=strict session cookie on every request.
- Login, enquiry and account changes are rate-limited per IP. The limiter is in-memory, so for strict limits across many serverless instances, move it to Redis/Upstash.
- The contact form has a honeypot field, and all input is validated with Zod and HTML-escaped in emails.
