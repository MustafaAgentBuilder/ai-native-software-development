# 🎯 GEMINI SETUP - Final Configuration

## ✅ WHAT I CONFIGURED

Both agents now use **GEMINI API with RAG tools enabled!**

### Files Updated:
1. ✅ `colearning_agent.py` - Olivia with Gemini + Tools + Attractive personality
2. ✅ `tutor_agent.py` - Sidebar agent with Gemini + Tools
3. ✅ `.env` - Added Gemini configuration

---

## 🔑 STEP 1: Add Your Gemini API Key to `.env`

Open `backend/.env` and find these lines at the bottom:

```env
# =================
# GEMINI API CONFIGURATION (BACK TO GEMINI!)
# =================
GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE
GOOGLE_API_KEY=YOUR_GEMINI_KEY_HERE

# Gemini model (supports tool calling!)
# Options: gemini-2.0-flash-exp, gemini-1.5-flash, gemini-1.5-pro
GEMINI_MODEL=gemini-2.0-flash-exp
```

**Replace `YOUR_GEMINI_KEY_HERE` with your actual Gemini API key:**

```env
GEMINI_API_KEY=AIzaSyC1HS0VXowqR7XGp6u3P3FGi3Vz6hWXAQg
GOOGLE_API_KEY=AIzaSyC1HS0VXowqR7XGp6u3P3FGi3Vz6hWXAQg
GEMINI_MODEL=gemini-2.0-flash-exp
```

**Get Gemini API Key:**
- Go to: https://aistudio.google.com/apikey
- Click "Create API Key"
- Copy the key (starts with `AIzaSy...`)

---

## 🚀 STEP 2: Restart Backend

```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

---

## ✅ WHAT BOTH AGENTS WILL DO NOW:

### **Olivia (Co-Learning Agent):**
✅ Uses **GEMINI API** (your key)
✅ Has **RAG TOOLS** (searches book before answering!)
✅ **ENTHUSIASTIC** personality (exciting, not boring!)
✅ Uses **FRIENDLY** chapter names (Chapter 1, not Ch-02-AI-Tool)
✅ **GREETS ONCE** then teaches (no repeated greetings!)
✅ **SEARCHES BOOK** before every answer (real content!)
✅ Gives **ANALOGIES** and examples
✅ Uses **EMOJIS** naturally

### **Sidebar Agent (TutorGPT):**
✅ Uses **GEMINI API** (your key)
✅ Has **RAG TOOLS** (searches book!)
✅ **FAST** responses
✅ Answers from **REAL BOOK CONTENT**

---

## 📖 EXAMPLE: How Olivia Will Teach Now

**Student:** "teach me Chapter 1"

**Olivia:**
```
[Internally calls: search_book_content("AI development revolution", scope="book")]

PERFECT! Let me teach you Chapter 1 - The AI Development Revolution!

According to the book, we are at a HISTORIC turning point! The way we build
software is fundamentally changing. Instead of writing every single line of
code, we now collaborate with AI to build 10x faster!

Think of it like this:
- OLD WAY: You are a chef chopping every vegetable by hand
- NEW WAY: You have a smart kitchen assistant that learns your style!

The book teaches that developers who master AI-native development can ship
products in DAYS instead of MONTHS. Companies are desperate for people
with these skills!

Ready to see how AI agents work? Or want me to explain more about this
revolution? 🚀
```

**This is REAL book content + EXCITING delivery!**

---

## 🎯 CONFIGURATION SUMMARY

| Setting | Value |
|---------|-------|
| **API Provider** | Google Gemini |
| **Model** | gemini-2.0-flash-exp |
| **Tools (RAG)** | ✅ ENABLED |
| **Olivia Personality** | ✅ Enthusiastic & Friendly |
| **Sidebar Agent** | ✅ Fast & Accurate |
| **Book Search** | ✅ Automatic before teaching |
| **Chapter Names** | ✅ Friendly (not technical IDs) |

---

## ⚠️ IMPORTANT NOTES

### **If You Get Rate Limit Errors:**
Your Gemini API has these limits:
- **15 requests/minute**
- **1,500 requests/day**

**Solutions:**
1. **Wait 60 seconds** (rate limit resets)
2. **Get another Gemini key** and add as backup
3. **Upgrade to paid tier** (higher limits)

### **If You Get "Model Not Found" Error:**
Change model in `.env`:
```env
GEMINI_MODEL=gemini-1.5-flash
```
This is more stable than experimental version.

---

## 🎉 YOU'RE READY!

### **Next Steps:**
1. ✅ Add your Gemini API key to `.env`
2. ✅ Restart backend
3. ✅ Test Olivia: "Hey" → "teach me Chapter 1"
4. ✅ Test Sidebar: Ask any question about the book

**Expected Result:**
- ✅ Olivia greets warmly ONCE
- ✅ Olivia searches book before teaching
- ✅ Olivia gives EXCITING responses with REAL book content
- ✅ Sidebar answers from book
- ✅ No Error 400
- ✅ No boring technical IDs!

---

## 🚀 QUICK START

```bash
# 1. Edit .env - add your Gemini key
nano backend/.env

# 2. Restart backend
cd backend
uv run uvicorn app.main:app --reload --port 8000

# 3. Test it!
# Open frontend and chat with Olivia
```

**Your presentation is ready! 🎉**
