# 🚀 GROQ MODELS - Current & Working (Nov 2025)

## ✅ RECOMMENDED MODELS (Choose One)

### **Option 1: Llama 3.3 70B Versatile** (BEST - DEFAULT)
```env
AGENT_MODEL=llama-3.3-70b-versatile
```
- **Best for:** Teaching, explanations, complex reasoning
- **Speed:** Fast (100-200 tokens/sec)
- **Quality:** Excellent
- **Rate Limit:** 30 req/min, 6,000 tokens/min

### **Option 2: Llama 3.1 8B Instant** (FASTEST)
```env
AGENT_MODEL=llama-3.1-8b-instant
```
- **Best for:** Quick answers, simple questions
- **Speed:** Ultra-fast (500+ tokens/sec)
- **Quality:** Good
- **Rate Limit:** 30 req/min, 20,000 tokens/min

### **Option 3: Mixtral 8x7B** (BALANCED)
```env
AGENT_MODEL=mixtral-8x7b-32768
```
- **Best for:** Long context, balanced performance
- **Speed:** Fast (150-300 tokens/sec)
- **Quality:** Very good
- **Rate Limit:** 30 req/min, 5,000 tokens/min

### **Option 4: Gemma 2 9B** (ALTERNATIVE)
```env
AGENT_MODEL=gemma2-9b-it
```
- **Best for:** Instruction following, structured output
- **Speed:** Fast (200-300 tokens/sec)
- **Quality:** Good
- **Rate Limit:** 30 req/min, 15,000 tokens/min

---

## 🎯 CURRENT CONFIGURATION

Your system is now using: **llama-3.3-70b-versatile**

This is the LATEST and BEST model for teaching!

---

## 📊 Model Comparison Table

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| **llama-3.3-70b-versatile** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Teaching, Explanations |
| llama-3.1-8b-instant | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Quick Q&A |
| mixtral-8x7b-32768 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Long context |
| gemma2-9b-it | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Structured tasks |

---

## 🔄 How to Change Model

1. Open `backend/.env`
2. Find line: `AGENT_MODEL=llama-3.3-70b-versatile`
3. Replace with one of the models above
4. Restart backend:
   ```bash
   cd backend
   uv run uvicorn app.main:app --reload --port 8000
   ```

---

## ⚠️ DECOMMISSIONED MODELS (DON'T USE)

These models no longer work:
- ❌ `llama-3.1-70b-versatile` (decommissioned)
- ❌ `llama3-70b-8192` (old version)
- ❌ `llama3-8b-8192` (old version)

---

## 🎯 For Your Presentation:

**Recommended:** Keep `llama-3.3-70b-versatile` (already configured!)

**Why?**
- ✅ Best teaching quality
- ✅ Good speed (< 1 second responses)
- ✅ Handles complex questions
- ✅ Perfect for demo

---

**Your system is ready! Just restart backend and test!** 🚀
