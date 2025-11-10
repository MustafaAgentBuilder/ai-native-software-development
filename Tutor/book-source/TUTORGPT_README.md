# TutorGPT - Interactive AI Tutor for Book Content

An interactive AI-powered tutor sidebar that helps students learn from the AI Native Software Development book. Features include a collapsible sidebar, text selection popover with quick actions, draggable chat window, and inline previews.

## 🎯 Features

### 1. **Agent Sidebar**
- Fixed sidebar on the left side
- Collapsible/expandable with smooth animations
- Minimizes to a small floating icon
- Avatar, title, and status indicator
- Persistent state (remembers open/closed state)

### 2. **Text Selection Popover**
- Appears when you highlight text in the book
- Five quick actions:
  - **📝 Summary** - Get a concise summary
  - **💡 Explain** - Get detailed explanation
  - **🎯 Main Points** - Extract key takeaways
  - **🔍 Example** - Get practical examples
  - **💬 Ask Tutor** - Open chat with selected text
- Keyboard accessible
- Touch-friendly for mobile

### 3. **Chat Window**
- Displays conversation with TutorGPT
- Draggable and resizable
- Dock left/right or float freely
- Persistent position and size
- Chat history saved in localStorage
- Typing indicators
- Message timestamps

### 4. **Inline Preview**
- Shows quick response preview near selected text
- Expandable/collapsible
- Auto-positioned to avoid overlapping
- Closable with smooth animations

### 5. **Modern UI/UX**
- Smooth animations with Framer Motion
- Responsive design (desktop + mobile)
- Accessibility features (ARIA labels, keyboard navigation)
- Dark mode support
- High contrast mode support
- Reduced motion support

## 📋 Prerequisites

- Node.js >= 20.0
- npm or yarn
- Backend API running (or use mock mode for development)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd Tutor/book-source
npm install
```

This will install all required packages including:
- `react-rnd` - For draggable/resizable windows
- `framer-motion` - For smooth animations
- All existing Docusaurus dependencies

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and set your values
nano .env
```

**Environment Variables:**

```bash
# Backend API URL (default: http://localhost:8000)
REACT_APP_API_URL=http://localhost:8000

# Use mock responses (true/false)
# Set to true for development without backend
REACT_APP_USE_MOCK=false

# Google Analytics (optional)
GA4_MEASUREMENT_ID=
```

### 3. Start the Backend (Optional)

If you want to use the real TutorGPT backend:

```bash
cd ../backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

### 4. Start the Development Server

```bash
npm start
```

The site will open at `http://localhost:3000`

### 5. Test the Features

1. **Sidebar**: Look for the TutorGPT sidebar on the left
2. **Text Selection**: Highlight any text in the book content
3. **Popover**: Click any of the action buttons
4. **Chat**: Try the "Ask Tutor" button or type in the chat
5. **Drag/Resize**: The chat window is draggable and resizable

## 🧪 Development Mode (No Backend Required)

To test the UI without running the backend:

```bash
# Set mock mode in .env
REACT_APP_USE_MOCK=true

# Start the dev server
npm start
```

Mock responses will be returned for all actions.

## 📁 Project Structure

```
book-source/
├── src/
│   ├── components/
│   │   └── tutor/
│   │       ├── TutorAgent.tsx         # Main container
│   │       ├── AgentSidebar.tsx       # Sidebar component
│   │       ├── ChatWindow.tsx         # Chat interface
│   │       ├── SelectionPopover.tsx   # Text selection popover
│   │       ├── InlinePreview.tsx      # Preview component
│   │       └── index.ts               # Component exports
│   ├── utils/
│   │   └── agentApi.ts                # API client
│   ├── css/
│   │   ├── tutor-agent.css            # TutorGPT styles
│   │   └── custom.css                 # Imports tutor-agent.css
│   └── theme/
│       └── Root.tsx                   # Integrates TutorAgent
├── .env.example                       # Environment template
└── TUTORGPT_README.md                 # This file
```

## 🎨 Customization

### Changing Colors

Edit `src/css/tutor-agent.css`:

```css
/* Sidebar gradient */
.tutorgpt-sidebar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Primary color for buttons */
.send-button {
  background: #6366f1; /* Change this */
}
```

### Adjusting Sidebar Width

```css
.tutorgpt-sidebar.expanded {
  width: 380px; /* Change this */
}
```

### Modifying Animations

Edit the Framer Motion variants in the components:

```tsx
// In AgentSidebar.tsx
animate={{ x: 0, opacity: 1 }}
transition={{ duration: 0.3, ease: "easeOut" }}
```

## 🔌 API Integration

### Backend Endpoints

The frontend expects these endpoints:

**1. Agent Action** - `POST /api/agent/action`
```json
{
  "action": "summary" | "explain" | "main_points" | "example" | "ask",
  "text": "Selected text here",
  "cursorContext": "Surrounding paragraph",
  "userId": "student-123",
  "uiHints": {
    "tone": "student-friendly",
    "length": "short"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Full response text",
  "preview": "Short preview (100 chars)"
}
```

**2. RAG Search** - `POST /api/rag/search`
```json
{
  "query": "search query",
  "scope": "current_chapter",
  "top_k": 5
}
```

**3. Health Check** - `GET /api/rag/health`
```json
{
  "status": "ok",
  "details": { ... }
}
```

### Custom API Client

To use a different backend, modify `src/utils/agentApi.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Update the endpoint paths if needed
async sendAction(actionData: AgentAction): Promise<AgentResponse> {
  const response = await fetch(`${this.baseUrl}/your-custom-endpoint`, {
    // ...
  });
}
```

## 📱 Mobile Support

All features are mobile-optimized:

- **Sidebar**: Becomes full-width when expanded
- **Popover**: Larger touch targets (48px minimum)
- **Chat**: Touch-friendly scrolling and input
- **Drag/Resize**: Works with touch gestures

Test on mobile:
```bash
npm start -- --host 0.0.0.0
# Access from mobile: http://your-ip:3000
```

## ♿ Accessibility

- **Keyboard Navigation**: All buttons are keyboard accessible
- **ARIA Labels**: Proper labels for screen readers
- **Focus Indicators**: Visible focus states
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **High Contrast**: Supports `prefers-contrast: high`
- **Semantic HTML**: Proper heading hierarchy

## 🐛 Troubleshooting

### Sidebar not showing
- Check browser console for errors
- Verify `TutorAgent` is imported in `Root.tsx`
- Check CSS import in `custom.css`

### Text selection popover not appearing
- Ensure you're selecting text within the book content
- Check that SelectionPopover is rendered in TutorAgent
- Try refreshing the page

### API errors
- Verify backend is running: `http://localhost:8000/docs`
- Check CORS settings in backend
- Try mock mode: `REACT_APP_USE_MOCK=true`

### Chat history not persisting
- Check browser localStorage (DevTools → Application → Local Storage)
- Clear storage and try again: `localStorage.clear()`

### Animations not smooth
- Check browser performance
- Disable animations in `tutor-agent.css` if needed
- Try reducing motion in browser settings

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sidebar opens/closes smoothly
- [ ] Sidebar minimizes to icon
- [ ] Text selection shows popover
- [ ] All 5 action buttons work
- [ ] Chat messages send/receive
- [ ] Chat window is draggable
- [ ] Chat window is resizable
- [ ] Dock left/right works
- [ ] Position persists after refresh
- [ ] Inline preview appears
- [ ] Preview is expandable/collapsible
- [ ] Mobile touch works
- [ ] Keyboard navigation works

### Browser Testing

Test in:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Android)

## 🚢 Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run serve

# Check build output
ls -lh build/
```

## 📊 Performance

Optimizations included:

- **Lazy Loading**: Components load on demand
- **Memoization**: React hooks prevent unnecessary re-renders
- **LocalStorage**: Chat history cached locally
- **CSS Animations**: GPU-accelerated transforms
- **Code Splitting**: Framer Motion loads separately

## 🔐 Security

- **XSS Protection**: All user input is sanitized
- **CORS**: Configure allowed origins in backend
- **API Keys**: Never expose in frontend (use backend proxy)
- **Rate Limiting**: Implement in backend if needed

## 📚 Component API

### TutorAgent
```tsx
<TutorAgent />
// No props - manages all state internally
```

### AgentSidebar
```tsx
<AgentSidebar onChatMessage={(message) => console.log(message)} />
```

### ChatWindow
```tsx
<ChatWindow
  messages={messages}
  onNewMessage={handleNewMessage}
  onClearHistory={handleClear}
  isInSidebar={true}
  isFloating={false}
/>
```

### SelectionPopover
```tsx
<SelectionPopover
  onOpenChat={(prefillText) => console.log(prefillText)}
  onNewMessage={handleNewMessage}
/>
```

### InlinePreview
```tsx
<InlinePreview
  content="Response text"
  position={{ top: 100, left: 200 }}
  onClose={() => setVisible(false)}
/>
```

## 🤝 Contributing

To add new features:

1. Create component in `src/components/tutor/`
2. Add styles to `src/css/tutor-agent.css`
3. Update exports in `src/components/tutor/index.ts`
4. Test in both desktop and mobile
5. Update this README

## 📄 License

Same as the main project.

## 🆘 Support

- **Issues**: https://github.com/panaversity/ai-native-software-development/issues
- **Docs**: https://ai-native.panaversity.org
- **Backend README**: `../backend/README.md`

---

**Built with** ❤️ **for AI-Native Software Development**
