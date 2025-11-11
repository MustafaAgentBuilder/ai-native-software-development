# 🚀 QUICK RESTART GUIDE - Dual API Key Setup

## ⚡ PRESENTATION READY IN 3 STEPS (2 minutes)

### STEP 1: Get TWO Gemini API Keys

**Option A (Recommended):** Get 2 separate keys
- Go to: https://aistudio.google.com/apikey
- Click "Create API Key" → Copy Key 1
- Click "Create API Key" again → Copy Key 2

**Option B (Quick Fix):** Use same key twice
- Use your existing `GEMINI_API_KEY` for both
- This still works, but doesn't double the rate limit

### STEP 2: Update `.env` File

Open `backend/.env` and add these two lines:

```env
# NEW: Separate keys for each agent
SIDEBAR_AGENT_API_KEY=AIzaSy_YOUR_FIRST_KEY_HERE
COLEARNING_AGENT_API_KEY=AIzaSy_YOUR_SECOND_KEY_HERE
```

**If using same key for both (Option B):**
```env
SIDEBAR_AGENT_API_KEY=AIzaSyC1HS0VXowqR7XGp6u3P3FGi3Vz6hWXAQg
COLEARNING_AGENT_API_KEY=AIzaSyC1HS0VXowqR7XGp6u3P3FGi3Vz6hWXAQg
```

### STEP 3: Restart Backend

**Using UV (Recommended):**
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

**Or using Python directly:**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

---

## ✅ Verify It Works

1. **Frontend**: Open http://localhost:3000
2. **Test Sidebar Agent**: Click sidebar chat → Ask "How many chapters?"
3. **Test Olivia (Co-Learning)**: Click "Start Learning" → Say "hi"

**Expected Results:**
- ✅ No "API Rate Limit" errors
- ✅ Olivia greets ONCE, then starts teaching
- ✅ Sidebar agent answers correctly: "5 parts, 13 chapters"
- ✅ Both agents search book before answering

---

## 🎯 What Changed?

**Before:**
- Both agents shared 1 API key = 15 requests/minute total
- Hit rate limit during demo

**After:**
- Each agent has own API key = 30 requests/minute total
- No rate limiting during presentation!

---

## 🆘 Emergency Backup (If Still Errors)

If you still see rate limit errors:

1. **Wait 60 seconds** (rate limit resets)
2. **Use Option B** (same key for both) to at least get agents working
3. **During presentation**: If rate limit hits, say "Let me show you the architecture while the API resets"

---

## 📊 Files Updated

1. `backend/app/agent/tutor_agent.py` - Sidebar agent with separate API key
2. `backend/app/agent/colearning_agent.py` - Olivia with separate API key
3. `backend/.env` - Add TWO new environment variables

**All changes preserve existing functionality - just adds dual API key support!**

---

## Good Luck with Your Presentation! 🎉
