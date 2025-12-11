# replit.md

## Overview

This is a 3D web-based cooking simulator game built for gamod.cloud. The application features an immersive kitchen environment using Three.js with React Three Fiber, where players complete recipes through interactive mini-games like chopping, stirring, and heat control. The game uses a state machine pattern to manage game phases (menu, recipe selection, cooking, mini-games, and completion).

## Recent Changes

### Phase 2: Interactive Mini-Games Enhancement (Completed)
- **ChoppingGame**: Swipe detection, cut quality scoring (perfect/good/poor), visual cut guides, combo system with multipliers, timer display, particle effects, and feedback messages
- **StirringGame**: Circular motion tracking with trail visualization, consistency meter, speed detection, splash/flour particles, rhythm bonuses, and color transitions
- **HeatControlGame**: Detailed stove model with rotatable knobs, flame particle system, smoke/steam effects, temperature gauges, and food state transitions (raw/cooking/cooked/burnt)
- **MeasuringGame**: Tiltable containers, liquid flow particles, precision meter with accuracy scoring, slow-motion mode, spill detection, and combo system
- **PlatingGame**: Drag-and-drop food placement, rotation controls, garnish library, sauce drizzle tool, symmetry checking, and arrangement scoring
- **New Recipes**: Added 6 new recipes (Chocolate Cake, Gourmet Steak, Sushi Platter, Tiramisu, Chocolate Chip Cookies) utilizing all 5 mini-games
- **Store Updates**: Extended MiniGameType union to include 'measuring' and 'plating', added camera presets for new mini-games

### Phase 1: Foundation & Core Mechanics (Completed)
- **Project Setup**: Added Google Fonts (Poppins, Inter, Playfair Display), cooking-themed color palette (#FF6B35, #F7931E, #C1666B, #FFF8F0)
- **Kitchen Environment**: 10m x 8m dimensions, walls with backsplash, countertops with drawer handles, sink with faucets, window frame, pot rack with hanging cookware
- **Camera System**: 7 presets (wide, closeup, firstperson, overhead, side, stove, cutting), smooth lerp transitions, camera shake function
- **Ingredient Models**: 15 types (tomato, onion, carrot, bell_pepper, lettuce, chicken, beef, egg, milk, cheese, butter, bread, rice, oil, water) with 4 cooking states each (raw, cooking, cooked, burnt)
- **Storage System**: localStorage with auto-save (30s), data validation, versioning, backup slots, export/import functionality (`client/src/lib/storage.ts`)
- **UI Framework**: Toast notification system (`client/src/components/ui/cooking-toast.tsx`), Framer Motion animations, responsive cooking-themed components

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
- Interactive mini-games: ChoppingGame, StirringGame, HeatControlGame, MeasuringGame, PlatingGame
- Camera system with presets for different cooking stations and mini-games

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