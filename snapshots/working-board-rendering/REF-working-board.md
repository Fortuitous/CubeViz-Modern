# Snapshot: Working Backgammon Board Rendering
**Date**: 2026-03-14
**State**: All boards rendering perfectly including first-load and cycling navigation.

## Bookmark Context
This directory contains a "frozen" copy of the core files that achieved perfect rendering for the Backgammon board. 

### Key Files in this Snapshot:
- `BackgammonBoard.jsx`: The refactored React component with state-based initialization and legacy call sequence.
- `Heatmap.jsx`: The heatmap visualization component with correct match length mapping.
- `index.html`: The host HTML that includes the required legacy `bglog` scripts.
- `index.css`: The styling that ensures the board container and SVG behave responsively.

## Implementation logic (The "Proven Pattern"):
1. **Engine Loading**: Ensure all legacy `bglog` scripts and dependencies (jQuery, TweenLite) are available on `window`.
2. **One-Time Initialization**: Use a state variable (`initialized`) to ensure `makeBoard()` and `loadTheme()` are called exactly once.
3. **Global State Reset**: Explicitly clear `ourTrayCheckerArray`, `ourCheckerNameArray`, and `moveListArray` before initialization to prevent checker accumulation.
4. **Deterministic Updates**: Wrap `loadXgId` and visual drawing in `animateFlag = false` to guarantee instantaneous state application without visual drift.
5. **Start Button Flow**: The state-based `initialized` flag ensures the first board position renders as soon as the engine is ready, even on the initial load from the deck selection screen.

## How to Restore
If rendering breaks in the future, compare current versions against these archived files to identify regressions in initialization logic or call sequences.
