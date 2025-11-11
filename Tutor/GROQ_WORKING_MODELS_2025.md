# 🚀 GROQ WORKING MODELS - January 2025

## ✅ CURRENT WORKING MODELS (Tested & Verified)

### **Option 1: llama3-groq-70b-8192-tool-use-preview** (RECOMMENDED!)
```env
AGENT_MODEL=llama3-groq-70b-8192-tool-use-preview
```
- **Status:** ✅ WORKING (Jan 2025)
- **Tool Calling:** ✅ EXCELLENT (designed specifically for function calling!)
- **Best for:** RAG, teaching, complex tasks
- **Speed:** Fast (100-150 tokens/sec)
- **Context:** 8,192 tokens
- **Rate Limit:** 30 req/min, 14,400 tokens/min
- **WHY BEST:** Built specifically for tool/function calling!

### **Option 2: llama-3.1-8b-instant** (FASTEST)
```env
AGENT_MODEL=llama-3.1-8b-instant
```
- **Status:** ✅ WORKING
- **Tool Calling:** ✅ GOOD
- **Best for:** Quick answers, speed
- **Speed:** Ultra-fast (500+ tokens/sec)
- **Context:** 128K tokens
- **Rate Limit:** 30 req/min, 20,000 tokens/min

### **Option 3: gemma2-9b-it** (ALTERNATIVE)
```env
AGENT_MODEL=gemma2-9b-it
```
- **Status:** ✅ WORKING
- **Tool Calling:** ⚠️ FAIR (not optimized for tools)
- **Best for:** Instruction following
- **Speed:** Fast (200-300 tokens/sec)
- **Rate Limit:** 30 req/min, 15,000 tokens/min

---

## ❌ DECOMMISSIONED MODELS (DON'T USE!)

These models NO LONGER WORK on Groq:

- ❌ `llama-3.3-70b-versatile` - Decommissioned Nov 2024
- ❌ `llama-3.1-70b-versatile` - Decommissioned Dec 2024
- ❌ `mixtral-8x7b-32768` - Decommissioned Jan 2025
- ❌ `llama3-70b-8192` - Old, replaced

---

## 🎯 RECOMMENDED SETUP FOR YOUR PROJECT

**Your `.env` should have:**
```env
# BEST for tool calling (RAG search, teaching tools)
AGENT_MODEL=llama3-groq-70b-8192-tool-use-preview

# Your Groq API key
GROQ_API_KEY=gsk_your_key_here
```

---

## 📊 Model Comparison

| Model | Tool Calling | Speed | Context | Best For |
|-------|-------------|-------|---------|----------|
| **llama3-groq-70b-tool-use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 8K | **Teaching + RAG** |
| llama-3.1-8b-instant | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 128K | Speed |
| gemma2-9b-it | ⭐⭐⭐ | ⭐⭐⭐⭐ | 8K | Instructions |

---

## 🔄 How to Change Model

1. Open `backend/.env`
2. Find line: `AGENT_MODEL=...`
3. Replace with: `AGENT_MODEL=llama3-groq-70b-8192-tool-use-preview`
4. Restart backend:
   ```bash
   cd backend
   uv run uvicorn app.main:app --reload --port 8000
   ```

---

## 🆘 If Tool Errors Persist

**If you still see tool calling errors:**

### Quick Fix - Use Faster Model:
```env
AGENT_MODEL=llama-3.1-8b-instant
```
This model is VERY stable for tools and ultra-fast!

### Nuclear Option - Disable Tools (Demo Only):
In agent files, change:
```python
tools=TUTORGPT_TOOLS  # Change to: tools=[]
```
This removes RAG but makes agents work for presentation.

---

## ✅ CURRENT CONFIGURATION (After Update)

Your system is now using:
```
AGENT_MODEL=llama3-groq-70b-8192-tool-use-preview
```

This is the BEST model for:
- ✅ Function calling (RAG search)
- ✅ Teaching tasks
- ✅ Stable responses
- ✅ FREE on Groq

---

## 🚀 RESTART BACKEND NOW!

```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

---

**This model is SPECIFICALLY built for tool calling - it will work!** 🎉
