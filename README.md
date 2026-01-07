# CRT Terminal Portfolio

A retro-styled 3D CRT terminal with WebGL effects built with TypeScript and Vite.

## Features

- **3D WebGL Rendering**: Terminal displayed on a 3D monitor with perspective camera
- **CRT Effects**: Authentic CRT monitor simulation with barrel distortion, scanlines, and phosphor glow
- **Terminal Emulation**: Powered by xterm.js with canvas renderer
- **Clean Architecture**: Dependency Inversion Principle (DIP) for terminal source abstraction
- **TypeScript**: Fully typed, modular codebase
- **Vite**: Fast development and optimized builds

## Architecture

The project follows SOLID principles with clear separation of concerns:

```
src/
├── core/                    # Core application logic
│   ├── Application.ts       # Main application orchestrator
│   └── ITerminalSource.ts   # Interface for terminal abstraction (DIP)
├── terminal/                # Terminal implementation
│   └── XTermAdapter.ts      # xterm.js adapter implementing ITerminalSource
├── rendering/               # WebGL rendering
│   ├── WebGLRenderer.ts     # Main renderer class
│   ├── screenShader.ts      # CRT screen shaders
│   └── bezelShader.ts       # Monitor bezel shaders
├── geometry/                # 3D geometry definitions
│   └── CRTMonitor.ts        # CRT monitor mesh generator
├── utils/                   # Utility functions
│   ├── matrix.ts            # Matrix math operations
│   └── shader.ts            # Shader compilation helpers
├── main.ts                  # Application entry point
└── style.css                # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
```

## Design Principles

### Dependency Inversion Principle (DIP)

The terminal and rendering are decoupled through the `ITerminalSource` interface:

- **High-level module**: `WebGLRenderer` depends on `ITerminalSource` abstraction
- **Low-level module**: `XTermAdapter` implements `ITerminalSource`
- This allows easy swapping of terminal implementations without modifying the renderer

### Single Responsibility Principle (SRP)

Each class has a single, well-defined responsibility:

- `Application`: Orchestrates the application lifecycle
- `WebGLRenderer`: Handles WebGL rendering
- `XTermAdapter`: Manages terminal logic
- `CRTMonitor`: Generates 3D geometry

### Separation of Concerns

- Terminal logic is isolated in `terminal/`
- Rendering logic is isolated in `rendering/`
- Geometry generation is isolated in `geometry/`
- Utilities are reusable and side-effect free

## Technologies

- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Next-generation frontend tooling
- [xterm.js](https://xtermjs.org/) - Terminal emulator for the web
- [WebGL](https://www.khronos.org/webgl/) - 3D graphics API

## License

ISC
