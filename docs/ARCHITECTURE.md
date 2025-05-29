# Socratic Project Architecture

## Overview

The Socratic Project is organized as a monorepo with a clean separation between applications and shared packages.

```
Socratic-Project/
├── apps/                          # All applications
│   ├── mobile/                    # React Native/Expo mobile app
│   ├── web-frontend/              # React web frontend
│   └── web-backend/               # Python Flask backend
├── packages/                      # Shared packages
│   ├── analytics/                 # Analytics service
│   ├── api-client/                # API client library
│   ├── common-types/              # Shared TypeScript types
│   └── ui-components/             # Shared UI components (planned)
├── docs/                          # Documentation
├── scripts/                       # Build/deployment scripts
└── tools/                         # Development tools
```

## Mobile App Structure (`apps/mobile/`)

The mobile app follows a feature-based architecture:

```
apps/mobile/
├── src/
│   ├── app/                       # App Router files (Expo Router)
│   │   ├── (tabs)/                # Tab navigation screens
│   │   ├── login.tsx              # Login screen route
│   │   ├── persona-selection.tsx  # Persona selection route
│   │   └── _layout.tsx            # Root layout
│   ├── features/                  # Feature-based organization
│   │   ├── auth/                  # Authentication feature
│   │   │   ├── AuthContext.tsx    # Auth context provider
│   │   │   └── LoginScreen.tsx    # Login screen component
│   │   └── chat/                  # Chat feature
│   │       └── components/        # Chat-specific components
│   │           ├── ChatHeader.tsx
│   │           ├── ChatInput.tsx
│   │           ├── MessageBubble.tsx
│   │           └── VoiceMessageInput.tsx
│   └── shared/                    # Shared utilities and components
│       ├── api/                   # API services
│       ├── components/            # Reusable UI components
│       │   ├── ThemedButton.tsx
│       │   ├── ThemedCard.tsx
│       │   ├── ThemedText.tsx
│       │   ├── ThemedView.tsx
│       │   └── ui/                # Low-level UI components
│       ├── constants/             # App constants
│       │   ├── Colors.ts
│       │   ├── personas.ts
│       │   └── spacingAndShadows.ts
│       ├── hooks/                 # Custom React hooks
│       └── utils/                 # Utility functions
└── config/                        # Configuration files
    ├── metro.config.js
    └── tsconfig.json
```

## Import Path Aliases

The mobile app uses TypeScript path mapping for clean imports:

- `@/*` - src root (`./src/*`)
- `@shared/*` - shared utilities (`./src/shared/*`)
- `@features/*` - feature modules (`./src/features/*`)
- `@app/*` - app router files (`./src/app/*`)

### Example Usage

```typescript
// Instead of relative imports
import { Colors } from '../../../shared/constants/Colors';

// Use clean aliases
import { Colors } from '@shared/constants/Colors';
import { useAuth } from '@features/auth/AuthContext';
import { ThemedButton } from '@shared/components/ThemedButton';
```

## Web Applications

### Frontend (`apps/web-frontend/`)
- React application built with Vite
- Uses Tailwind CSS for styling
- Shares types and API client with mobile app

### Backend (`apps/web-backend/`)
- Python Flask application
- RESTful API serving both mobile and web clients
- PostgreSQL database with SQLAlchemy ORM

## Shared Packages

### `@socratic/common-types`
Shared TypeScript type definitions used across all applications.

### `@socratic/api-client`
Unified API client library that works in both React Native and web environments.

### `@socratic/analytics`
Analytics service with platform-specific implementations for mobile and web.

## Package Management

The project uses pnpm workspaces for efficient dependency management:

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## Development Scripts

```json
{
  "dev:mobile": "pnpm --filter @socratic/mobile start",
  "dev:web": "pnpm --filter @socratic/web-frontend dev",
  "dev:backend": "pnpm --filter @socratic/web-backend dev",
  "build:mobile": "pnpm --filter @socratic/mobile build",
  "android": "pnpm --filter @socratic/mobile android",
  "ios": "pnpm --filter @socratic/mobile ios"
}
```

## Benefits of This Architecture

1. **Feature-Based Organization**: Related code is grouped together, making it easier to find and modify
2. **Clear Separation**: Apps vs packages vs tools are clearly separated
3. **Scalability**: Easy to add new features, apps, or shared packages
4. **Code Reuse**: Shared packages eliminate duplication across platforms
5. **Type Safety**: Shared types ensure consistency across all applications
6. **Maintainability**: Clean import paths and logical organization improve developer experience

## Migration Notes

This architecture was refactored from a previous structure where:
- `Socratic-Mobile/` → `apps/mobile/`
- `Socratic-Web/frontend-react/` → `apps/web-frontend/`
- `Socratic-Web/backend/` → `apps/web-backend/`
- Import paths updated from `@/src/*` to feature-based aliases

All functionality has been preserved while improving the overall organization and developer experience. 