# Environment Variables Setup Guide

## Prerequisites

1. **Install Node.js** (if not already installed):
   - Download from: https://nodejs.org/
   - This will also install `npm`

2. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

## Setting Up Environment Variables

### Option 1: Using Vercel CLI (Recommended)

1. **Login to Vercel** (if not already logged in):
   ```bash
   vercel login
   ```

2. **Link your project** (if not already linked):
   ```bash
   vercel link
   ```

3. **Pull environment variables**:
   ```bash
   vercel env pull
   ```
   This will create a `.env.local` file with your Vercel KV credentials.

### Option 2: Manual Setup

If you can't use the CLI, you can manually create `.env.local` with:

```env
KV_URL=your-kv-url-here
KV_REST_API_URL=your-kv-rest-api-url-here
KV_REST_API_TOKEN=your-kv-rest-api-token-here
KV_REST_API_READ_ONLY_TOKEN=your-kv-read-only-token-here
```

You can find these values in:
- Vercel Dashboard → Your Project → Storage → KV Database → Settings

## Important Note: KV vs Edge Config

**This project uses `@vercel/kv` (Redis/KV storage), NOT Edge Config.**

- ✅ **Already installed**: `@vercel/kv` (in package.json)
- ❌ **Not needed**: `@vercel/edge-config`

If you want to use Edge Config instead of KV, you would need to:
1. Install: `npm install @vercel/edge-config`
2. Update your API code to use Edge Config instead of KV
3. This is NOT recommended unless you have a specific reason

## Installing Dependencies

After setting up environment variables:

```bash
npm install
```

This will install `@vercel/kv` and other dependencies.

## Testing Locally

Once environment variables are set up:

```bash
npm run dev
```

Or:

```bash
vercel dev
```

This will start a local development server that uses your Vercel KV database.

## Troubleshooting

### "vercel command not found"
- Make sure Vercel CLI is installed: `npm install -g vercel`
- Make sure Node.js/npm is in your PATH

### "npm command not found"
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### Environment variables not working
- Make sure `.env.local` exists in the project root
- Make sure you're using `vercel dev` (not a regular Node.js server)
- Check that KV is connected in Vercel Dashboard → Storage



