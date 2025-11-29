# How to Fix Supabase CORS Error for Localhost

## The Problem

When accessing your app from `http://localhost:8000`, you might see "Failed to fetch" errors when trying to connect to Supabase. This is usually a CORS (Cross-Origin Resource Sharing) issue.

## Solution: Configure CORS in Supabase

### Step 1: Open Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project (the one with URL: `https://zgpitqqdhbsfvktmqpyw.supabase.co`)

### Step 2: Navigate to API Settings

1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu

### Step 3: Configure CORS

1. Scroll down to find the **"CORS Configuration"** section
2. You'll see a text area or input field for allowed origins
3. Add your localhost URL:
   ```
   http://localhost:8000
   ```
   
   Or, for development, you can use a wildcard (less secure, but easier):
   ```
   *
   ```

4. If there are multiple origins, add them one per line or separated by commas (depending on the interface)

5. Click **Save** or **Update**

### Step 4: Verify Project Status

While you're in the Settings, also check:

1. Make sure your project is **Active** (not paused)
   - If it's paused, you'll see a message at the top
   - Click "Resume" or "Unpause" if needed

2. Verify your **Project URL** matches what's in `storage.js`:
   - Should be: `https://zgpitqqdhbsfvktmqpyw.supabase.co`
   - Check Settings → API → Project URL

3. Verify your **anon/public key** matches what's in `storage.js`:
   - Check Settings → API → Project API keys → `anon` `public`

### Step 5: Test Again

1. Refresh your browser at `http://localhost:8000/test-supabase-connection.html`
2. The connection should now work!

## Alternative: Check Browser Console

If CORS is configured but you still get errors:

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for CORS-related errors
4. Go to **Network** tab
5. Try the connection again
6. Click on the failed request to see detailed error information

## Common Issues

### Issue 1: "Project is paused"
- **Fix**: Go to Supabase Dashboard → Settings → General → Resume project

### Issue 2: "Table does not exist"
- **Fix**: Create the `bookings` table in Supabase Dashboard → SQL Editor
- Run the CREATE TABLE SQL (see your setup documentation)

### Issue 3: "Permission denied"
- **Fix**: Check Row Level Security (RLS) policies
- Go to Supabase Dashboard → Authentication → Policies
- Make sure there are policies allowing read/write access, or temporarily disable RLS for testing

### Issue 4: Firewall/Antivirus blocking
- Some security software blocks localhost connections
- Try temporarily disabling to test
- Add an exception for `localhost:8000` if needed

## Still Having Issues?

1. **Check the enhanced test page**: `http://localhost:8000/test-supabase-connection.html`
   - It now shows more detailed error information
   - Look for specific error codes and messages

2. **Verify Supabase credentials**:
   - Open `storage.js`
   - Compare the URL and key with Supabase Dashboard → Settings → API

3. **Test Supabase directly**:
   - Try accessing: `https://zgpitqqdhbsfvktmqpyw.supabase.co/rest/v1/`
   - You should get a response (even if it's an error, it means the API is reachable)

4. **Check network connectivity**:
   - Make sure you have internet access
   - Try accessing Supabase Dashboard in your browser
   - If you can't access the dashboard, there might be a network issue




