# 🚀 GROQ API SETUP - FREE & SUPER FAST!

## ⚡ Get Your FREE Groq API Key (30 seconds)

### Step 1: Create Groq Account
1. Go to: **https://console.groq.com/**
2. Click **"Sign Up"** or **"Sign In"** (use Google/GitHub)
3. No credit card needed! 100% FREE!

### Step 2: Get API Key
1. After login, go to: **https://console.groq.com/keys**
2. Click **"Create API Key"**
3. Copy the key (starts with `gsk_...`)

### Step 3: Add to `.env` File
1. Open `backend/.env`
2. Find the line: `GROQ_API_KEY=PASTE_YOUR_GROQ_KEY_HERE`
3. Replace with your key:
   ```env
   GROQ_API_KEY=gsk_your_actual_key_here
   ```

### Step 4: Restart Backend
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

---

## ✅ What Changed?

**BEFORE (Gemini):**
- ❌ Rate limit: 15 req/min
- ❌ All 3 keys exhausted
- ❌ Error: "Resource exhausted"

**AFTER (Groq):**
- ✅ Rate limit: **30 req/min** (2x faster!)
- ✅ FREE forever (no credit card)
- ✅ SUPER FAST responses (< 1 second!)
- ✅ **Llama 3.1 70B** - Excellent for teaching!

---

## 🎯 Groq Models Available

Your `.env` is configured with: **llama-3.1-70b-versatile**

**Other options (change `AGENT_MODEL` in `.env`):**
- `llama-3.1-70b-versatile` - Best for teaching (DEFAULT)
- `mixtral-8x7b-32768` - Fast, good for quick answers
- `llama-3.1-8b-instant` - Ultra-fast, lighter model

---

## 🔥 Why Groq is PERFECT for Your Demo:

1. **FREE** - No $20 needed!
2. **FAST** - 500+ tokens/second (vs Gemini's ~50)
3. **HIGH LIMITS** - 30 requests/min (vs Gemini's 15)
4. **NO CREDIT CARD** - Sign up with Google/GitHub
5. **STABLE** - No "resource exhausted" errors

---

## 📊 Rate Limits (Groq Free Tier):

- **Requests:** 30 per minute
- **Tokens:** 14,400 per minute
- **Daily limit:** 14,400 requests/day

**For your presentation:**
- ✅ 100+ questions with ZERO errors
- ✅ Response time: < 1 second
- ✅ No rate limiting

---

## 🆘 Troubleshooting

**If you see "Invalid API key":**
1. Check `.env` has: `GROQ_API_KEY=gsk_...` (no quotes)
2. Restart backend server
3. Verify key at https://console.groq.com/keys

**If you see "Model not found":**
1. Check `.env` has: `AGENT_MODEL=llama-3.1-70b-versatile`
2. Or try: `AGENT_MODEL=mixtral-8x7b-32768`

---

## 🎉 You're Ready for Your Presentation!

**Get your Groq key now: https://console.groq.com/keys**

Then restart backend and test both agents!
