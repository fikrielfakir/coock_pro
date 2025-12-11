# replit.md

## Overview

This is a 3D web-based cooking simulator game built for gamod.cloud. The application features an immersive kitchen environment using Three.js with React Three Fiber, where players complete recipes through interactive mini-games like chopping, stirring, and heat control. The game uses a state machine pattern to manage game phases (menu, recipe selection, cooking, mini-games, and completion).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Single-page application using React 18 with TypeScript for type safety
- **React Three Fiber**: 3D rendering layer built on Three.js for the kitchen environment and gameplay
- **@react-three/drei**: Helper components for common Three.js patterns (textures, controls, etc.)
- **Zustand**: Lightweight state management with `subscribeWithSelector` middleware for game state, audio, and cooking mechanics
- **TailwindCSS + Radix UI**: Styling with utility classes and accessible component primitives (shadcn/ui pattern)
- **Vite**: Build tool with hot module replacement, GLSL shader support, and asset handling for 3D models and audio

### State Management Pattern
The game uses three Zustand stores:
- `useCookingGame`: Core game logic (phases, recipes, scores, mini-game states)
- `useAudio`: Sound management (background music, sound effects, mute state)
- `useGame`: Simple ready/playing/ended phase tracking

### 3D Scene Structure
- Kitchen components: Stove, Refrigerator, CuttingBoard, Countertops, Lighting
- Interactive mini-games: ChoppingGame, StirringGame, HeatControlGame
- Camera system with presets for different cooking stations

### Backend Architecture
- **Express.js**: REST API server with logging middleware
- **In-memory storage**: Default `MemStorage` class implementing `IStorage` interface for user data
- **Drizzle ORM**: Database schema definition with PostgreSQL dialect (ready for database integration)

### Build System
- Development: Vite dev server with HMR proxied through Express
- Production: esbuild bundles server code, Vite builds client to `dist/public`
- Server dependencies are selectively bundled for faster cold starts

## External Dependencies

### Database
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable
- **Drizzle ORM + drizzle-kit**: Schema management and migrations in `./migrations`
- Schema defined in `shared/schema.ts` with users table

### 3D Graphics & Audio
- **Three.js ecosystem**: Core 3D rendering, post-processing effects
- **GLSL shaders**: Custom shader support via vite-plugin-glsl
- **Audio files**: Background music and sound effects in `/client/public/sounds/`
- **Textures**: Wood textures and other materials in `/client/public/textures/`

### UI Components
- **Radix UI**: Full suite of accessible primitives (dialogs, menus, tooltips, etc.)
- **Lucide React**: Icon library
- **TanStack React Query**: Data fetching (configured but minimal server interaction)

### Session Management
- **connect-pg-simple**: PostgreSQL session store (available but not actively used)
- **express-session**: Session middleware setup ready