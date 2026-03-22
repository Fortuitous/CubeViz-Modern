# CubeViz Modern

Backgammon match data, aggregated and visualized.

## Overview

CubeViz Modern is a React-based visualization tool that explores the effect of match-scores on cube decisions. It presents cube-action data for all scores up to a 25-point match simultaneously, allowing users to see patterns as a whole rather than peeking at individual data points.

## Architecture

The project is built with **React** and **Vite**, designed to be responsive across desktop, tablet, and mobile devices.

### Key Components
- **Desktop/Tablet Layout**: A side-by-side pane layout featuring a Backgammon Board, Position Details, and a comprehensive Heatmap.
- **Mobile View**: A tab-based navigation system (Position, Scores, Settings) optimized for portrait use on phones.
- **Legacy Integration**: Integrates with legacy JavaScript engines and data structures for backward compatibility with established backgammon data formats.

## Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
npm install
```

### Local Development
To start the development server with network access enabled:
```bash
npm run dev -- --host
```

### Building for Production
```bash
npm run build
```

### Deployment
The project is configured for GitHub Pages. Pushing to the `master` branch triggers an automated deployment via GitHub Actions.

## Version
Current Version: **1.0.0 (Stable Release)**
