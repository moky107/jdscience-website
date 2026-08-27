# JD Science Website

A production-ready React/Vite website for JD Science tutoring.

## Included pages
- Home
- About
- Subjects & Pricing
- Book a Session
- Resources/Blog
- Videos
- Contact

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Visitor accounts
In the Supabase dashboard:

1. Authentication → Providers → Email: enable email sign-up.
2. Turn **Confirm email** on so new visitors must verify their inbox before logging in.
3. Authentication → URL Configuration:
   - **Site URL:** `https://www.jdscience.co.uk`
   - **Redirect URLs:**
     - `https://www.jdscience.co.uk/auth/callback`
     - `https://jdscience.co.uk/auth/callback`
     - `http://localhost:5173/auth/callback` (local development only)
4. Authentication → Email Templates → Confirm signup: keep `{{ .ConfirmationURL }}` as the button link. Do not hard-code localhost or an obsolete domain.

## Advice, exam tips and education news
Run `supabase/migrations/20260818_education_posts.sql` once in the Supabase SQL editor. After that, publish posts from the admin dashboard. They appear in the homepage **Advice** section.

## Deploy on Vercel
1. Upload this folder to GitHub.
2. Import the GitHub repository into Vercel.
3. Click Deploy.
4. Add your Namecheap domain in Vercel Settings > Domains.
5. Copy the Vercel DNS records into Namecheap Advanced DNS.

## Replace before launch
- Phone number
- Payment link
- Booking/calendar link
- Social media links
- YouTube video embeds
