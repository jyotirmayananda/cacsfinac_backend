# Troubleshooting 500 Error on Signin

## 🔴 Error: `Failed to load resource: the server responded with a status of 500`

This means the backend server encountered an internal error. Here's how to fix it:

---

## 🔍 Step 1: Check Render Logs

**Most Important:** Check your Render logs to see the actual error!

1. Go to: https://dashboard.render.com
2. Click on your backend service
3. Click **Logs** tab
4. Look for error messages around the time you tried to sign in

**Look for:**
- `❌ MongoDB not connected`
- `❌ JWT_SECRET not set`
- `❌ Signin error: ...`
- Any red error messages

---

## 🔧 Common Causes & Fixes

### Cause 1: MongoDB Not Connected

**Symptoms:**
- Logs show: `❌ MongoDB not connected`
- Health endpoint shows: `"database": "disconnected"`

**Fix:**
1. **Check MongoDB Atlas Network Access:**
   - Go to: https://cloud.mongodb.com → Network Access
   - Add Render IPs: `74.220.48.0/24` and `74.220.56.0/24`
   - Or temporarily: `0.0.0.0/0` (for testing)

2. **Verify MONGODB_URI in Render:**
   - Go to Render Dashboard → Environment
   - Check `MONGODB_URI` is set correctly
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/cacs?retryWrites=true&w=majority`
   - Make sure password is correct (if you rotated it)

3. **Test Connection:**
   ```bash
   curl https://cacsfinac-backend.onrender.com/health
   ```
   Should show: `"database": "connected"`

---

### Cause 2: JWT_SECRET Missing

**Symptoms:**
- Logs show: `❌ JWT_SECRET not set in environment variables`
- Error: `Server configuration error`

**Fix:**
1. **Generate a new JWT secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Add to Render:**
   - Go to Render Dashboard → Environment
   - Add/Update: `JWT_SECRET` = (paste the generated secret)
   - Save and redeploy

---

### Cause 3: Database Query Error

**Symptoms:**
- Logs show: `❌ Signin error: ...`
- MongoDB connection is OK but query fails

**Possible Causes:**
- User collection doesn't exist
- Database name mismatch
- Collection permissions issue

**Fix:**
1. **Check MongoDB Atlas:**
   - Verify database name: `cacs`
   - Verify collection exists: `users`
   - Check database user has read/write permissions

2. **Test with a new user:**
   - Try signing up a new user first
   - Then try signing in

---

### Cause 4: Backend Service Sleeping

**Symptoms:**
- 503 or 500 error
- Service shows "Sleeping" in Render dashboard

**Fix:**
1. **Wake up the service:**
   - Visit: https://cacsfinac-backend.onrender.com/health
   - Wait 30-60 seconds
   - Try again

---

## 🧪 Testing Steps

### 1. Test Health Endpoint
```bash
curl https://cacsfinac-backend.onrender.com/health
```

**Expected:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "connected",
  "environment": "production"
}
```

**If database is "disconnected":**
- MongoDB connection issue (see Cause 1)

### 2. Test Signin Endpoint
```bash
curl -X POST https://cacsfinac-backend.onrender.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Expected (if user exists):**
```json
{
  "success": true,
  "message": "Sign in successful",
  "token": "...",
  "user": {...}
}
```

**Expected (if user doesn't exist):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**If 500 error:**
- Check Render logs for specific error

---

## 📋 Checklist

- [ ] Render logs checked for error messages
- [ ] MongoDB connection verified (health endpoint)
- [ ] `MONGODB_URI` set correctly in Render
- [ ] MongoDB Atlas IPs whitelisted
- [ ] `JWT_SECRET` set in Render
- [ ] Backend service is "Live" (not "Sleeping")
- [ ] Health endpoint returns OK
- [ ] Tested signin endpoint with curl

---

## 🔍 Debugging Tips

### Enable Detailed Error Messages

The code now shows more detailed errors. Check Render logs for:
- `❌ MongoDB not connected` - Database issue
- `❌ JWT_SECRET not set` - Configuration issue
- `❌ Signin error:` - Check the error message after this

### Check Request Format

Make sure frontend is sending:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Check CORS

If you see CORS errors in browser console:
- Verify `FRONTEND_URL` is set in Render
- Check frontend domain matches exactly

---

## 🆘 Still Not Working?

1. **Check Render Logs** - This is the most important step!
2. **Copy the exact error message** from logs
3. **Check all environment variables** are set
4. **Verify MongoDB connection** (health endpoint)
5. **Test with curl** to isolate frontend vs backend issues

---

## ✅ After Fixing

Once fixed, test:
1. Health endpoint: `/health`
2. Signup: `/api/auth/signup`
3. Signin: `/api/auth/signin`
4. From frontend: Try login again

