# How to Fix "Failed to fetch" Error

## The Problem

When you open HTML files directly from your file system (using `file://` protocol), browsers block fetch requests to external APIs like Supabase for security reasons. This causes the "TypeError: Failed to fetch" error.

## Solution: Run a Local Web Server

You need to serve your files through HTTP instead of opening them directly.

### Option 1: Using Python (Recommended - Usually Pre-installed)

1. **Open PowerShell or Command Prompt** in your project folder (`C:\Yan\Project_reserve`)

2. **Run one of these commands:**
   ```bash
   # For Python 3 (most common)
   python -m http.server 8000
   
   # OR for Python 2
   python -m SimpleHTTPServer 8000
   ```

3. **Open your browser** and go to:
   - `http://localhost:8000/test-supabase-connection.html`
   - `http://localhost:8000/index.html`
   - etc.

4. **Press Ctrl+C** in the terminal to stop the server when done.

### Option 2: Using the Provided Scripts

**Windows Batch File:**
- Double-click `start-server.bat`

**PowerShell Script:**
- Right-click `start-server.ps1` → "Run with PowerShell"

### Option 3: Using Node.js (if you have it installed)

```bash
npx http-server -p 8000 -c-1
```

Then open `http://localhost:8000/test-supabase-connection.html`

### Option 4: Using VS Code Live Server Extension

1. Install the "Live Server" extension in VS Code
2. Right-click on any HTML file → "Open with Live Server"

## After Starting the Server

1. Open `http://localhost:8000/test-supabase-connection.html` in your browser
2. Check the test results - you should now see successful connections
3. All your other pages will also work with Supabase when accessed via `http://localhost:8000/`

## Important Notes

- **Always use `http://localhost:8000/`** instead of `file:///` when testing
- The server must be running while you're using the app
- This is only needed for local development - when deployed to a web server, it works automatically

## If You Still Get Errors

After running the server, if you still see connection errors:

1. **Check Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Settings → API
   - Make sure your project URL and anon key match what's in `storage.js`

2. **Check CORS Settings:**
   - In Supabase Dashboard → Settings → API
   - Under "CORS Configuration", make sure `http://localhost:8000` is allowed (or use `*` for development)

3. **Check Network Tab:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try the connection again
   - Look for any blocked requests or CORS errors

4. **Check Firewall/Antivirus:**
   - Some security software blocks local servers
   - Try temporarily disabling to test








