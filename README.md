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

```bash
# Run the puzzle
bun start

# Run tests
bun run test

# Lint/format
bun run lint
```

## Project Structure

```
src/
├── components/
│   ├── HashiGrid.tsx     # Main grid container
│   ├── HashiRow.tsx      # Row of nodes
│   └── __tests__/        # Component tests
├── types.ts              # TypeScript types
└── index.tsx             # Entry point
```
