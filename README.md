# Cogito

A cross-platform philosophical dialogue application featuring AI-powered conversations with historical philosophical personas.

## 🏗️ Architecture

This is a monorepo containing:

- **Mobile App** (`apps/mobile/`) - React Native/Expo application
- **Web Frontend** (`apps/web-frontend/`) - React web application  
- **Backend API** (`apps/web-backend/`) - Python Flask REST API
- **Shared Packages** (`packages/`) - Common types, API client, and analytics

See [Architecture Documentation](docs/ARCHITECTURE.md) for detailed information.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Python 3.9+ (for backend)
- Expo CLI (for mobile development)

### Installation

```bash
# Install all dependencies
pnpm install

# Install backend dependencies
cd apps/web-backend
pip install -r requirements.txt
```

### Development

```bash
# Start mobile app
pnpm dev:mobile

# Start web frontend
pnpm dev:web

# Start backend API
pnpm dev:backend

# Run on specific platforms
pnpm android
pnpm ios
```

## 📱 Mobile App

Built with React Native and Expo, featuring:

- **Philosophical Personas**: Chat with Socrates, Kant, Nietzsche, and more
- **Voice Messages**: Record and transcribe voice messages
- **Guest Mode**: Try the app without creating an account
- **Conversation History**: Save and revisit past dialogues
- **Cross-Platform**: iOS and Android support

### Mobile Development

```bash
cd apps/mobile

# Start development server
pnpm start

# Run on iOS simulator
pnpm ios

# Run on Android emulator
pnpm android

# Build for production
pnpm build:production
```

## 🌐 Web Frontend

React application with:

- **Responsive Design**: Works on desktop and mobile browsers
- **Real-time Chat**: Instant messaging with AI personas
- **Authentication**: Firebase Auth integration
- **Modern UI**: Built with Tailwind CSS

### Web Development

```bash
cd apps/web-frontend

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 🔧 Backend API

Python Flask application providing:

- **RESTful API**: Serves both mobile and web clients
- **AI Integration**: OpenAI GPT integration for conversations
- **User Management**: Authentication and user profiles
- **Data Persistence**: PostgreSQL database

### Backend Development

```bash
cd apps/web-backend

# Set up environment variables
cp .env.example .env

# Run development server
python run.py

# Run database migrations
flask db upgrade
```

## 📦 Shared Packages

### `@socratic/common-types`
TypeScript type definitions shared across all applications.

### `@socratic/api-client`
Unified API client that works in both React Native and web environments.

### `@socratic/analytics`
Analytics service with platform-specific implementations.

## 🛠️ Development Scripts

```bash
# Development
pnpm dev:mobile          # Start mobile app
pnpm dev:web            # Start web frontend  
pnpm dev:backend        # Start backend API

# Building
pnpm build:mobile       # Build mobile app
pnpm build:web         # Build web frontend

# Mobile specific
pnpm android           # Run on Android
pnpm ios              # Run on iOS

# Utilities
pnpm clean            # Clean all build artifacts
pnpm lint             # Lint all packages
pnpm test             # Run all tests
```

## 🏗️ Project Structure

```
Socratic-Project/
├── apps/
│   ├── mobile/                 # React Native mobile app
│   ├── web-frontend/          # React web application
│   └── web-backend/           # Python Flask API
├── packages/
│   ├── analytics/             # Analytics service
│   ├── api-client/           # Shared API client
│   └── common-types/         # Shared TypeScript types
├── docs/                     # Documentation
└── scripts/                  # Build and deployment scripts
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in each app directory:

**Mobile** (`apps/mobile/.env`):
```
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_FIREBASE_CONFIG=...
```

**Web Frontend** (`apps/web-frontend/.env`):
```
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_CONFIG=...
```

**Backend** (`apps/web-backend/.env`):
```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=...
FIREBASE_CREDENTIALS=...
```

## 🚀 Deployment

### Mobile App
```bash
# Build for app stores
cd apps/mobile
eas build --platform all --profile production
```

### Web Frontend
```bash
# Build and deploy
cd apps/web-frontend
pnpm build
# Deploy dist/ folder to your hosting service
```

### Backend
```bash
# Deploy to your cloud provider
cd apps/web-backend
# Follow your deployment platform's instructions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the established patterns
4. Ensure all tests pass: `pnpm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT integration
- Expo team for the excellent React Native framework
- The philosophical community for inspiration 