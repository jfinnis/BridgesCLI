# Hashi Puzzle

A CLI-based Hashiwokakero (Bridges) puzzle renderer built with React and Ink. This exists mostly to
gain more experience with an agent-based workflow.

## What is Hashiwokakero?

Hashiwokakero (橋をかけろ, "build bridges") is a logic puzzle where you connect islands with bridges. Each island has a number indicating how many bridges must connect to it.

## Tech Stack

- **React** - UI components
- **Ink** - CLI rendering
- **TypeScript** - Type safety
- **Vitest** - Testing
- **Biome** - Linting/formatting
- **Bun** - Runtime (or Node.js)

## Getting Started

# Run the puzzle (interactive mode - press q to quit)
``` bash
bun start
```

# Run tests
``` bash
bun run test
```

# Lint/format
``` bash
bun run lint
```

### CLI Options

- `-s, --stdout` - Output to stdout and exit immediately (for testing)
- `-p, --puzzle <identifier>` - Select a puzzle by its shorthand identifier (see `samplePuzzles.ts`)

