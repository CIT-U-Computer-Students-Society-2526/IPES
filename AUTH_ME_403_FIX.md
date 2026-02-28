# Auth/Me 403 Error - Fix Summary

## Root Cause
The deployed frontend didn't have the correct API base URL configured. The frontend was trying to call `/api/auth/me/` on a default localhost URL instead of the production backend URL.

## Changes Made

### 1. Frontend Environment Configuration ✅
**Created:** `frontend/.env.production`
- Sets `VITE_API_BASE_URL=https://css-ipes.onrender.com/api`
- This ensures the deployed frontend calls the correct backend API

**Created:** `frontend/.env.development` 
- Sets `VITE_API_BASE_URL=http://localhost:8000/api`
- For local development

### 2. Backend Session/Cookie Configuration ✅
**Updated:** `IPES/settings.py`
- `SESSION_COOKIE_DOMAIN = '.onrender.com'` - Allows cookies to be shared across subdomains
- `CSRF_COOKIE_DOMAIN = '.onrender.com'` - Same for CSRF tokens
- `SESSION_COOKIE_SAMESITE = 'None'` - Required for cross-domain cookies
- `CSRF_COOKIE_SAMESITE = 'None'` - Required for cross-domain cookies
- Both have `SECURE = True` to enforce HTTPS

## Deployment Steps

### Step 1: Push Code Changes
```bash
git add .
git commit -m "Fix: Configure API base URL for production and fix cross-domain cookies"
git push origin dev
```

### Step 2: Configure Render Environment
For the **frontend service** on Render Dashboard:
1. Go to Settings → Environment
2. Add/Verify: `VITE_API_BASE_URL=https://css-ipes.onrender.com/api`
3. Make sure the build command uses `.env.production`

For the **backend service**, verify:
- `DEBUG=False`
- `ALLOWED_HOSTS` includes `css-ipes.onrender.com`
- Database credentials are correct

### Step 3: Redeploy
1. Redeploy frontend service (this will pick up the new environment variables)
2. Optionally redeploy backend to ensure cookie settings take effect

### Step 4: Test
1. Visit `https://css-ipes-frontend.onrender.com`
2. Log in with credentials
3. Verify that the select-organization page loads without 403 errors
4. Check browser DevTools → Network to confirm:
   - POST to `/api/auth/login/` returns 200
   - GET to `/api/auth/me/` returns 200 with user data

## How It Works
1. User logs in via `/api/auth/login/` (calls the backend directly)
2. Backend sets a session cookie with domain `.onrender.com` and `SameSite=None; Secure`
3. Frontend stores user data in localStorage
4. SelectOrganization component calls `useCurrentUser()` to fetch `/api/auth/me/`
5. The frontend includes `credentials: 'include'` in the request
6. Browser includes the session cookie (because both frontend and backend are on `.onrender.com`)
7. Backend recognizes the authenticated session and returns user data

## Troubleshooting
If you still see 403 errors after deployment:

1. **Clear browser cache and cookies**
2. **Check Render logs** for the backend:
   - Look for CSRF errors or authentication failures
   
3. **Verify the API URL** in browser console:
   - Open DevTools → Console
   - Type: `import.meta.env.VITE_API_BASE_URL`
   - Should show: `https://css-ipes.onrender.com/api`

4. **Check CORS headers** in browser Network tab:
   - GET request to `/auth/me/` should have:
     - `Access-Control-Allow-Credentials: true`
     - `Set-Cookie` headers if setting new cookies

5. **Verify environment variables** on Render:
   - Backend should have all required env vars
   - Frontend should have `VITE_API_BASE_URL` set correctly
