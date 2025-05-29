# Calendar Assistant - AI-Powered Calendar Management

A modern, intelligent calendar assistant built with Next.js that uses AI to help you manage your schedule effortlessly through natural conversation.

![Calendar Assistant](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🎨 Modern UI/UX
- **Beautiful Design**: Gradient backgrounds with glass morphism effects
- **Responsive Layout**: Seamless experience from mobile to desktop
- **Smooth Interactions**: Animated components and transitions
- **Custom Scrolling**: Elegant scroll behavior with custom scrollbars
- **Quick Actions**: Sidebar with shortcuts and recent activity

### 🤖 AI-Powered Chat Interface
- **Natural Language**: Speak to your calendar like a human assistant
- **Quick Suggestions**: Pre-built prompts for common tasks
- **Smart Responses**: Context-aware AI that understands follow-ups
- **Real-time Typing**: Live typing indicators and smooth messaging

### 📅 Calendar Integration
- **Google Calendar**: Full integration with your existing calendar
- **Smart Scheduling**: AI helps find optimal meeting times
- **Confirmation Flow**: Safe modifications with preview and approval
- **Productivity Insights**: AI-generated insights about your schedule

### 🛡️ User Experience
- **Intuitive Interface**: Clean, modern design that's easy to navigate
- **Accessibility**: Full keyboard navigation and screen reader support
- **Error Handling**: Graceful error states and helpful feedback
- **Performance**: Optimized for speed and responsiveness

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Zapier MCP credentials (for calendar integration)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nimish-html/calendar-agent.git
cd calendar-agent
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=sk-your-openai-api-key
ZAPIER_MCP_URL=https://mcp.zapier.com/api/mcp/mcp
ZAPIER_MCP_API_KEY=your_zapier_mcp_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 💬 How to Use

### Getting Started
1. **Welcome Screen**: The app greets you with quick start examples
2. **Natural Language**: Type or click suggestions like "What's on my calendar today?"
3. **Smart Responses**: The AI understands context and provides helpful information
4. **Quick Actions**: Use the sidebar shortcuts for common tasks

### Example Conversations
```
You: "What's on my calendar today?"
AI: Shows your schedule with times, locations, and details

You: "Schedule a meeting with Sarah tomorrow at 2 PM"
AI: Creates a confirmation preview for you to approve

You: "Find me a free hour this week for a project review"
AI: Analyzes your calendar and suggests optimal time slots
```

### Desktop Features
- **Sidebar Navigation**: Quick actions and recent activity
- **Header Shortcuts**: Fast access to today's schedule and meetings
- **Responsive Design**: Optimized layout for larger screens

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom utilities
- **UI Components**: shadcn/ui for consistent design
- **AI Integration**: OpenAI Responses API
- **Calendar**: Zapier MCP for Google Calendar integration
- **Icons**: Lucide React for beautiful icons

## 📁 Project Structure

```
calendar-agent/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles with utilities
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage with modern design
│   ├── components/
│   │   ├── chat/              # Chat interface components
│   │   │   ├── chat-container.tsx
│   │   │   ├── chat-input.tsx
│   │   │   ├── chat-message.tsx
│   │   │   ├── message-list.tsx
│   │   │   └── typing-indicator.tsx
│   │   └── ui/                # Reusable UI components
│   └── lib/                   # Utilities and integrations
├── .cursor/                   # Development documentation
├── public/                    # Static assets
└── README.md
```

## 🔧 Development

### Available Scripts
```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Code Quality
- **TypeScript**: Full type safety throughout the codebase
- **ESLint**: Code linting for consistency
- **Prettier**: Code formatting (configured in editor)

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Other Platforms
- **Netlify**: Works with Next.js static export
- **Railway**: Full-stack deployment with environment variables
- **Docker**: Containerized deployment options available

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Follow the existing code style
2. Add TypeScript types for new features
3. Test your changes thoroughly
4. Update documentation as needed

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you have questions or need help:
- Open an issue on GitHub
- Check the documentation in `.cursor/PRD.md`
- Review the implementation details in the codebase

---

**Built with ❤️ using Next.js, TypeScript, and AI**
