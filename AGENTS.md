# AGENTS.md

This is a CLI renderer for Hashiwokakero (Bridges) puzzles. It renders a grid of numbered islands in a terminal using Ink (React for CLI).

## Commands

- `bun start` - Run the puzzle (interactive mode)
- `bun start --stdout` - Run puzzle and output to stdout (for testing)
- `bun start --puzzle <encoding>` - Run with a specific puzzle encoding
- `bun run test` - Run unit tests
- `bun run typehceck` - typescript typechecker
- `bun run lint` - Lint and format

## Testing

Tests use Vitest with `@testing-library/react` patterns via `ink-testing-library`.

## Code Style

- Run linting before committing - the lint command uses Biome.js
- Add comments to separate code blocks. Don't remove existing comments.
- Don't re-export imports - no barrel files

