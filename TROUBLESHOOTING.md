# 🛠️ Troubleshooting Guide

## Issue: App Not Generating Prompts

### Symptoms
- App loads correctly
- Shows "Enhancing..." message
- Eventually shows "This is taking longer than expected"
- No prompts are generated

### Root Cause Analysis

#### 1. **API Key Issues** (Most Common)
**Problem**: Invalid, missing, or incorrectly configured API key

**Check:**
1. Open browser Developer Tools (F12) → Console
2. Look for "🔑 API Key Debug:" messages
3. Verify API key status:
   ```
   🔑 API Key Debug:
   - Final API key: FOUND (should be FOUND, not NOT FOUND)
   - API key length: >30 (should be substantial length)
   - API key preview: AIzaSyB... (should start with AIza)
   ```

**Solution:**
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update `.env.local`:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Restart dev server: `npm run dev`

#### 2. **Network/CORS Issues**
**Problem**: API requests being blocked

**Check Console for:**
- CORS errors
- Network timeout errors
- 403/401 authentication errors

**Solution:**
- Ensure API key has proper permissions
- Check if running behind corporate firewall
- Verify Gemini API is accessible from your location

#### 3. **Environment Variable Loading**
**Problem**: Vite not loading environment variables

**Check:**
1. `.env.local` file exists in project root
2. Variables start with `VITE_` for client-side access
3. Restart development server after .env changes

#### 4. **API Rate Limits**
**Problem**: Exceeding Gemini API rate limits

**Check Console for:**
- Rate limit error messages
- 429 HTTP status codes

**Solution:**
- Wait a few minutes before retrying
- Upgrade to paid API plan if needed

### Quick Fixes

#### Fix 1: Environment Variables Reset
```bash
# Delete current env file
rm .env.local

# Create new one with your API key
echo "GEMINI_API_KEY=your_actual_key_here" > .env.local
echo "VITE_GEMINI_API_KEY=your_actual_key_here" >> .env.local

# Restart server
npm run dev
```

#### Fix 2: Clear Browser Cache
1. Open Developer Tools (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"
3. Or use Incognito/Private browsing mode

#### Fix 3: Check API Key Validity
```bash
# Test API key directly (replace YOUR_KEY)
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY"
```

### Debug Steps

1. **Check Console Logs**:
   - Open F12 → Console
   - Look for API key debug info
   - Check for error messages

2. **Check Network Tab**:
   - F12 → Network
   - Try generating prompt
   - Look for failed requests

3. **Verify Dependencies**:
   ```bash
   npm install
   npm run build  # Should complete without errors
   ```

4. **Test API Directly**:
   - Use the curl command above
   - Should return JSON response, not error

### For Deployment Issues

#### Vercel Deployment
1. Add environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`
   - `VITE_GEMINI_API_KEY`

2. Check Vercel function logs for errors

3. Ensure `api/gemini-stream.js` is being deployed

#### Environment Variable Priority
1. Production: Vercel environment variables
2. Development: `.env.local` file
3. Fallback: Built-in placeholder (will fail)

### Still Having Issues?

1. **Check the debug logs** in browser console
2. **Verify API key** works with direct curl test
3. **Ensure environment file** is properly formatted
4. **Restart development server** after any .env changes
5. **Check for typos** in environment variable names

The debug function will show exactly what's happening with API key detection, which should help identify the specific issue.
