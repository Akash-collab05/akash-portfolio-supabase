AKASH PORTFOLIO — SUPABASE AUTH STARTER
======================================

FILES
-----
index.html   Portfolio and login/sign-up UI
style.css    Responsive design
app.js       Supabase email/password, Google OAuth, GitHub OAuth, reset, and sign-out

1) ADD YOUR PUBLISHABLE KEY
---------------------------
Open app.js and replace PASTE_YOUR_PUBLISHABLE_KEY_HERE with your Supabase
sb_publishable_... key. Never put a Supabase secret/service-role key in frontend code.

2) RUN LOCALLY ON WINDOWS
-------------------------
Open Command Prompt in this folder and run:
    python -m http.server 8000
Keep the terminal open, then visit:
    http://localhost:8000
Do not double-click index.html or use a file:/// URL.

3) SUPABASE URL CONFIGURATION
-----------------------------
In Supabase Dashboard > Authentication > URL Configuration:
- Site URL: http://localhost:8000
- Add Redirect URL: http://localhost:8000/**
Save changes.

4) EMAIL/PASSWORD
-----------------
In Authentication > Sign In / Providers, make sure Email is enabled.
If email confirmation is on, new users must confirm their email before logging in.
For production email delivery, configure SMTP if needed.

5) GOOGLE OAUTH
---------------
- Supabase > Authentication > Sign In / Providers > Google.
- Enable Google and copy the callback URL shown by Supabase.
- Create OAuth credentials in Google Cloud Console.
- Add the Supabase callback URL to Google's Authorized redirect URIs.
- Put the Google Client ID and Client Secret into Supabase's Google provider settings.

6) GITHUB OAUTH
---------------
- Supabase > Authentication > Sign In / Providers > GitHub.
- Enable GitHub and copy the callback URL shown by Supabase.
- Create an OAuth App in GitHub Developer Settings.
- Set its Authorization callback URL to the Supabase callback URL.
- Copy GitHub Client ID and Client Secret into Supabase's GitHub provider settings.

OAuth buttons will not work until the provider credentials are configured.

7) DEPLOYMENT
-------------
When deploying, add your production URL to Supabase Redirect URLs and set Site URL
to your production URL. Keep localhost allowed for local development if desired.
The portfolio copy and projects are sample content; edit index.html to personalize it.

This is a frontend starter. Do not use a frontend-only email allowlist to protect
sensitive data.
