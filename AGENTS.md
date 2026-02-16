# AGENTS.md

This file provides context for AI assistants working on this codebase.

## Project Overview

This is a CLI renderer for Hashiwokakero (Bridges) puzzles. It renders a grid of numbered islands in a terminal using Ink (React for CLI).

## Architecture

### Data Flow
1. `HashiGrid` receives `rows: HashiNodeData[][]` and `numNodes: number`
2. Each row contains `HashiNodeData` objects with `position` and `value`
3. `HashiRow` renders each node at its position
4. Grid validates puzzle consistency on render

### Key Types (`src/types.ts`)
```typescript
type HashiNodeData = {
    position: number  // Index in the row (0 to numNodes-1)
    value: number     // Bridge count for this island
}
```

### Key Components

- **HashiGrid.tsx**: Main grid container with validation logic. Exports `ROW_HEIGHT`, `NODE_WIDTH`, `SPACE_BETWEEN`, `OUTER_PADDING` constants.
- **HashiRow.tsx**: Renders a single row of nodes.

## Commands

- `bun start` - Run the puzzle (interactive mode)
- `bun start --stdout` - Run puzzle and output to stdout (for testing)
- `bun start --puzzle <encoding>` - Run with a specific puzzle encoding
- `bun run test` - Run typecheck and tests
- `bun run lint` - Lint and format

## Testing

Tests use Vitest with `@testing-library/react` patterns via `ink-testing-library`.

## Code Style

- Biome is configured in `biome.json`
- Run linting before committing
- No custom ESLint/Prettier config - Biome handles everything
- Add comments to break up sections but don't over do it. Don't need to explain simple things.


## Notes

- This is a renderer only - no game logic yet (bridge placement, validation, etc.)
- Uses Ink's `Box` component for layout
- The grid has a single border with white color
