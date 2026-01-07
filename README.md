# CRT Terminal Portfolio

A retro-styled terminal portfolio with CRT monitor effects built with TypeScript and Vite.

## Features

- **WebGL CRT Effects**: Authentic CRT monitor simulation with:
  - Barrel distortion
  - Scanlines
  - Phosphor glow
- **Terminal Emulation**: Powered by xterm.js
- **TypeScript**: Fully typed codebase
- **Vite**: Fast development and optimized builds

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

## Project Structure

```
new_portfolio/
├── src/
│   ├── main.ts       # Main application entry point
│   └── style.css     # Global styles
├── index.html        # HTML entry point
├── tsconfig.json     # TypeScript configuration
├── package.json      # Project dependencies
└── README.md         # This file
```

## Technologies

- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Next-generation frontend tooling
- [xterm.js](https://xtermjs.org/) - Terminal emulator for the web
- [WebGL](https://www.khronos.org/webgl/) - 3D graphics API

## License

ISC
