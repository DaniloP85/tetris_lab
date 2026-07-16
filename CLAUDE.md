# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Tetris game built with vanilla JavaScript, HTML, and CSS (no frameworks), rendered on an HTML canvas. Bundled with webpack. The current branch (`remove-firebase`) is removing the Firebase real-time score-sharing integration; Firebase dependencies may still appear in `package.json` while that work is in progress.

## Commands

```bash
npm start            # webpack dev server, opens browser
npm run server       # alternative: express + webpack-dev-middleware on port 3000
npm run build        # webpack build to dist/
npm test             # run all jest tests in tests/
npm run watch:test   # jest in watch mode
npm run test-coverage
```

Run a single test file:

```bash
npx jest --no-cache tests/rotacao.spec.js
```

Tests use jest with `babel-jest` (see `jest.config.js`); there is no lint setup.

## Architecture

Naming mixes Portuguese and English (`matriz` = matrix, `rotacao` = rotation, `componete` is an intentional/legacy misspelling of "componente"). Keep existing names when editing.

### Coordinate system (core convention)

Everything is pixel-based on a 33px grid stride (30px drawn cell + 3px gap):

- Board: 9 columns × 18 rows. Pixel x range 0–297 (left edge -33 and right edge 297 are out of bounds), bottom edge y = 594.
- Convert pixel → matrix index by dividing by 33: `matriz[y / 33][x / 33]`.
- The board state matrix holds `0` (empty), `'c'` (cell occupied by the currently falling piece), or a color string (locked piece).

### Modules (`src/`)

- `main.js` — entry point. Sets up the canvas, spawns the first piece, instantiates `Componente`, and maps keyboard events (WASD/arrows, Enter = start, P = pause, Space = hard drop) to its methods.
- `Componente.js` — the game engine class: movement (`left`/`right`/`down`/`downAll`), the falling timer (`setInterval`, speed decreases per level), collision against the matrix, line detection/clearing, scoring (`points = [100, 300, 500, 900]` × level), next-piece preview, and game over.
- `rotacao.js` — `Rotate` class. Converts the piece's pixel locations into a normalized small matrix, applies a 90° clockwise 2D rotation (`matrixEmpty[j][n - 1 - i] = matrix[i][j]`), cycles angles 0→90→180→270, and converts back to pixel coordinates. **Note the inverted semantics of `isPossible(current, matrix)`: it returns `true` when the rotation is NOT possible** (out of bounds or collision), so callers reject the move when it returns true.
- `Tetraminos.js` — static definitions of the 7 pieces (O, I, L, J, T, Z, S) as absolute pixel `location` arrays plus `color`, `size` (bounding matrix dimension, 3 or 4), `type`, `angle`, `minX`/`minY`.
- `keyBoard.js` — draws the on-screen keyboard indicator that highlights pressed keys.
- `utils.js` — canvas drawing helpers (board grid, score/level/time panels, next-piece area) and the `random` piece picker.

The README's "Technical Challenge" section documents the rotation math in detail if you need it.

## Deployment

`.github/workflows/gh-pages.yml` deploys on push to `main`: `npm ci` → fetch `.env` from AWS Secrets Manager → `npm run build` → sync `dist/` to S3 → invalidate CloudFront. Webpack's `dotenv-webpack` plugin injects `.env` values at build time.
