# 🪟 Windows Setup Guide - Fix RAG "0 Results" Issue

## 🔍 Problem

Running `simple_test.py` shows:
```
✓ Found 0 results   ❌ NO RESULTS!
```

## 📋 Solution

Run ingestion on your **Windows machine**:

```powershell
cd "P:\Ai native Book\ai-native-software-development\Tutor\backend"
.venv\Scripts\activate
python quick_ingest.py
```

This takes ~5-10 minutes and populates ChromaDB with 2,026 chunks.

## 🧪 Then Test

```powershell
python simple_test.py
```

Should now show results!

## 🤖 Fix API Key Issue

Your API key is suspended. Get new one:
1. https://aistudio.google.com/app/apikey
2. Update `.env` file
3. Run: `python test_agent_live.py`

See full guide in HOW_TO_TEST_AGENT_RAG.md
